import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const machine = searchParams.get('machine') || ''
  const plant = searchParams.get('plant') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''

  if (from && to) {
    const { data } = await supabase.from('production')
      .select('date,good_parts,rejection,machine,product,shift,plant')
      .gte('date', from).lte('date', to)
      .order('date', { ascending: true })
    return NextResponse.json({ success: true, data: data || [] })
  }

  let query = supabase.from('production').select('*, production_slots(slot_name, good_parts, rejection, downtime, remarks)')
    .eq('date', date)
    .order('created_at', { ascending: false })

  if (machine) query = query.eq('machine', machine)
  if (plant) query = query.eq('plant', plant)

  const { data } = await query
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istDate = new Date(now.getTime() + istOffset)
  const today = istDate.toISOString().split('T')[0]

  const slots = d.slots || []
  const totalGood = slots.reduce((a: number, s: any) => a + (parseFloat(s.good) || 0), 0)
  const totalRej = slots.reduce((a: number, s: any) => a + (parseFloat(s.rejection) || 0), 0)
  const totalDown = slots.reduce((a: number, s: any) => a + (parseFloat(s.down) || 0), 0)
  const cavities = parseFloat(d.cavities) || 0
  const shotsThisShift = cavities > 0 ? Math.round((totalGood + totalRej) / cavities) : 0

  const entryDate = d.date || today
  const entryShift = d.shift
  const entryPlant = d.plant
  const entryMachine = d.machine || ''

  const rowData = {
    date: entryDate,
    shift: entryShift,
    plant: entryPlant,
    machine: entryMachine,
    operator: d.operator || '',
    operator2: d.operator2 || '',
    product: d.product || '',
    mould: d.mould || '',
    cavities: parseFloat(d.cavities) || 0,
    cycle_time: parseFloat(d.cycleTime) || 0,
    material: d.material || '',
    good_parts: Math.round(totalGood),
    rejection: Math.round(totalRej),
    rejection_weight: slots.reduce((s:number,e:any)=>s+(parseFloat(e.rejWeight)||0),0),
    downtime: Math.round(totalDown),
    shots_this_shift: shotsThisShift,
    machine_status: d.machineStatus || 'running',
    stop_reason: d.stopReason || '',
    remarks: d.remarks || '',
    entered_by: d.enteredBy || ''
  }

  // Check if entry already exists for this date+machine+shift+plant+mould
  const { data: existingRows } = await supabase.from('production')
    .select('id')
    .eq('date', entryDate)
    .eq('machine', entryMachine)
    .eq('shift', entryShift)
    .eq('plant', entryPlant)
    .eq('mould', d.mould || '')
    .order('created_at', { ascending: true })
    .limit(1)
  const existing = (existingRows && existingRows.length > 0) ? existingRows[0] : null

  let prodId: string
  let wasUpdate = false

  if (existing) {
    prodId = existing.id
    wasUpdate = true
  } else {
    // INSERT new row (totals filled later)
    const { data: prod, error } = await supabase.from('production').insert(rowData).select().single()
    if (error) return NextResponse.json({ success: false, msg: error.message })
    prodId = prod.id
  }

  // ── Merge slots: keep old slots, update/add the ones just submitted ──
  if (prodId && slots.length > 0) {
    for (const s of slots) {
      const slotName = s.slot || ''
      if (!slotName) continue
      // delete this specific slot if it exists (so we replace just this slot)
      await supabase.from('production_slots').delete().eq('production_id', prodId).eq('slot_name', slotName)
      // insert fresh
      await supabase.from('production_slots').insert({
        production_id: prodId,
        slot_name: slotName,
        good_parts: parseFloat(s.good) || 0,
        rejection: parseFloat(s.rejection) || 0,
        downtime: parseFloat(s.down) || 0,
        remarks: s.remarks || ''
      })
    }
  }

  // ── Recalculate row totals from ALL slots (old + new) ──
  const { data: allSlots } = await supabase.from('production_slots')
    .select('good_parts,rejection,downtime').eq('production_id', prodId)
  const sumGood = (allSlots || []).reduce((a, s) => a + (s.good_parts || 0), 0)
  const sumRej = (allSlots || []).reduce((a, s) => a + (s.rejection || 0), 0)
  const sumDown = (allSlots || []).reduce((a, s) => a + (s.downtime || 0), 0)
  const sumShots = cavities > 0 ? Math.round((sumGood + sumRej) / cavities) : 0

  // update the row with merged totals + latest meta fields
  await supabase.from('production').update({
    ...rowData,
    good_parts: Math.round(sumGood),
    rejection: Math.round(sumRej),
    downtime: Math.round(sumDown),
    shots_this_shift: sumShots,
  }).eq('id', prodId)


  // Update mould shot counter — ONLY on new insert (not on update, warna double count hoga)
  if (!wasUpdate && d.mould && shotsThisShift > 0) {
    const mouldCode = d.mould.split(' - ')[0]
    const { data: mould } = await supabase.from('mould_master').select('*').eq('mould_code', mouldCode).maybeSingle()
    if (mould) {
      const newShots = (mould.current_shots || 0) + shotsThisShift
      const remaining = (mould.next_pm_at_shots || 0) - newShots
      const pct10 = mould.pm_frequency_shots * 0.1
      const newStatus = remaining <= 0 ? 'OVERDUE' : remaining < pct10 ? 'DUE SOON' : 'Active'
      await supabase.from('mould_master').update({ current_shots: newShots, status: newStatus }).eq('id', mould.id)
    }
  }

  return NextResponse.json({
    success: true,
    msg: `${wasUpdate ? 'Updated' : 'Saved'}! Total Good: ${Math.round(sumGood).toLocaleString()} | Rej: ${Math.round(sumRej).toLocaleString()}`
  })
}
