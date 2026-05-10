import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const machine = searchParams.get('machine') || ''
  const plant = searchParams.get('plant') || ''

  let query = supabase
    .from('production')
    .select('*, production_slots(slot_name, good_parts, rejection, downtime, remarks)')
    .eq('date', date)
    .order('created_at', { ascending: false })

  if (machine) query = query.eq('machine', machine)
  if (plant) query = query.eq('plant', plant)

  const { data } = await query
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  const prods = d.products || []
  const results = []

  for (const prod of prods) {
    const slots = (prod.slots || []).filter((s: any) =>
      parseFloat(s.good) > 0 || parseFloat(s.rejection) > 0 || parseFloat(s.down) > 0 || s.remarks
    )
    if (slots.length === 0) continue

    const totalGood = slots.reduce((a: number, s: any) => a + (parseFloat(s.good) || 0), 0)
    const totalRej = slots.reduce((a: number, s: any) => a + (parseFloat(s.rejection) || 0), 0)
    const totalDown = slots.reduce((a: number, s: any) => a + (parseFloat(s.down) || 0), 0)
    const cavities = parseFloat(prod.cavities) || 0
    const ct = parseFloat(prod.cycleTime) || 0
    const shotsPerSlot = cavities > 0 && ct > 0 ? Math.floor((180 * 60) / ct) * cavities : 0
    const totalShots = shotsPerSlot > 0 ? Math.round((totalGood + totalRej) / cavities) : 0

    const { data: prodData, error } = await supabase.from('production').insert({
      date: d.date || today,
      shift: d.shift,
      plant: d.plant,
      machine: d.machine,
      operator: prod.operator || '',
      operator2: prod.operator2 || '',
      product: prod.product || '',
      mould: prod.mould || '',
      cavities,
      cycle_time: ct,
      material: prod.material || '',
      good_parts: Math.round(totalGood),
      rejection: Math.round(totalRej),
      downtime: Math.round(totalDown),
      shots_this_shift: totalShots,
      machine_status: d.machineStatus || 'running',
      stop_reason: d.stopReason || '',
      remarks: prod.remarks || '',
      entered_by: d.enteredBy
    }).select().single()

    if (error) return NextResponse.json({ success: false, msg: error.message })

    if (prodData && slots.length > 0) {
      const slotRows = slots.map((s: any) => ({
        production_id: prodData.id,
        slot_name: s.slot || '',
        good_parts: parseFloat(s.good) || 0,
        rejection: parseFloat(s.rejection) || 0,
        downtime: parseFloat(s.down) || 0,
        remarks: s.remarks || ''
      }))
      await supabase.from('production_slots').insert(slotRows)

      if (prod.mould && totalShots > 0) {
        const mouldCode = prod.mould.split(' - ')[0]
        const { data: mould } = await supabase.from('mould_master').select('*').eq('mould_code', mouldCode).maybeSingle()
        if (mould && mould.pm_frequency_shots > 0) {
          const newShots = (mould.current_shots || 0) + totalShots
          const remaining = (mould.next_pm_at_shots || 0) - newShots
          const pct10 = mould.pm_frequency_shots * 0.1
          const newStatus = remaining <= 0 ? 'OVERDUE' : remaining < pct10 ? 'DUE SOON' : 'Active'
          await supabase.from('mould_master').update({ current_shots: newShots, status: newStatus }).eq('id', mould.id)
        }
      }
    }
    results.push(prodData)
  }

  if (results.length > 0) return NextResponse.json({ success: true, msg: `${results.length} product(s) saved!` })
  return NextResponse.json({ success: false, msg: 'Koi data nahi bhara!' })
}
