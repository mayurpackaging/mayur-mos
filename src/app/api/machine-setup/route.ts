import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const plant = searchParams.get('plant') || ''

  const { data: setup } = await supabase
    .from('machine_setup')
    .select('*')
    .eq('date', date)
    .eq('plant', plant)
    .order('machine')

  return NextResponse.json({ success: true, setup: setup || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  if (d.type === 'setup') {
    const results = []
    for (const m of (d.machines || [])) {
      if (!m.machine) continue

      // First try to delete existing, then insert fresh
      await supabase.from('machine_setup')
        .delete()
        .eq('date', d.date || today)
        .eq('plant', d.plant)
        .eq('machine', m.machine)

      const { data, error } = await supabase.from('machine_setup').insert({
        date: d.date || today,
        plant: d.plant,
        machine: m.machine,
        product: m.product || '',
        mould: m.mould || '',
        cavities: parseFloat(String(m.cavities)) || 0,
        cycle_time: parseFloat(String(m.cycleTime)) || 0,
        operator: m.operator || '',
        operator2: m.operator2 || '',
        valid_from_slot: m.validFromSlot || '8am-11am',
        created_by: d.createdBy || ''
      })

      if (error) {
        console.error('Insert error:', error)
        return NextResponse.json({ success: false, msg: error.message })
      }
      results.push(m.machine)
    }
    return NextResponse.json({ success: true, msg: `${results.length} machines setup saved!` })
  }

  if (d.type === 'bulk_slot') {
    let saved = 0
    const errors: string[] = []

    for (const entry of (d.entries || [])) {
      if (!entry.machine) continue
      if (!entry.good && !entry.rejection && !entry.down && entry.status === 'running') continue

      const totalGood = parseFloat(entry.good) || 0
      const totalRej = parseFloat(entry.rejection) || 0
      const totalDown = parseFloat(entry.down) || 0
      const cavities = parseFloat(entry.cavities) || 0
      const shotsThisSlot = cavities > 0 ? Math.round((totalGood + totalRej) / cavities) : 0

      if (entry.editId) {
        await supabase.from('production').update({
          good_parts: Math.round(totalGood),
          rejection: Math.round(totalRej),
          downtime: Math.round(totalDown),
          remarks: entry.remarks || ''
        }).eq('id', entry.editId)

        await supabase.from('production_slots').update({
          good_parts: Math.round(totalGood),
          rejection: Math.round(totalRej),
          downtime: Math.round(totalDown),
          remarks: entry.remarks || ''
        }).eq('production_id', entry.editId).eq('slot_name', d.slot)

        saved++
        continue
      }

      const { data: prod, error } = await supabase.from('production').insert({
        date: d.date || today,
        shift: d.shift,
        plant: d.plant,
        machine: entry.machine,
        operator: entry.operator || '',
        operator2: entry.operator2 || '',
        product: entry.product || '',
        mould: entry.mould || '',
        cavities: parseFloat(entry.cavities) || 0,
        cycle_time: parseFloat(entry.cycleTime) || 0,
        material: '',
        good_parts: Math.round(totalGood),
        rejection: Math.round(totalRej),
        downtime: Math.round(totalDown),
        shots_this_shift: shotsThisSlot,
        machine_status: entry.status || 'running',
        stop_reason: entry.stopReason || '',
        remarks: entry.remarks || '',
        entered_by: d.enteredBy
      }).select().single()

      if (error) { errors.push(`${entry.machine}: ${error.message}`); continue }

      if (prod) {
        await supabase.from('production_slots').insert({
          production_id: prod.id,
          slot_name: d.slot,
          good_parts: Math.round(totalGood),
          rejection: Math.round(totalRej),
          downtime: Math.round(totalDown),
          remarks: entry.remarks || ''
        })

        if (entry.mould && shotsThisSlot > 0) {
          const mouldCode = entry.mould.split(' - ')[0]
          const { data: mould } = await supabase.from('mould_master').select('*').eq('mould_code', mouldCode).maybeSingle()
          if (mould && mould.pm_frequency_shots > 0) {
            const newShots = (mould.current_shots || 0) + shotsThisSlot
            const remaining = (mould.next_pm_at_shots || 0) - newShots
            const pct10 = mould.pm_frequency_shots * 0.1
            const newStatus = remaining <= 0 ? 'OVERDUE' : remaining < pct10 ? 'DUE SOON' : 'Active'
            await supabase.from('mould_master').update({ current_shots: newShots, status: newStatus }).eq('id', mould.id)
          }
        }
        saved++
      }
    }

    if (saved > 0) return NextResponse.json({ success: true, msg: `${saved} machines ka ${d.slot} slot saved!` })
    return NextResponse.json({ success: false, msg: errors[0] || 'Koi data nahi bhara!' })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
