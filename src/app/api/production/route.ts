import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]
  
  const slots = d.slots || []
  const totalGood = slots.reduce((a: number, s: any) => a + (parseFloat(s.good) || 0), 0)
  const totalRej = slots.reduce((a: number, s: any) => a + (parseFloat(s.rejection) || 0), 0)
  const totalDown = slots.reduce((a: number, s: any) => a + (parseFloat(s.down) || 0), 0)
  const cavities = parseFloat(d.cavities) || 0
  const shotsThisShift = cavities > 0 ? Math.round((totalGood + totalRej) / cavities) : 0

  const { data: prod, error } = await supabase
    .from('production')
    .insert({
      date: d.date || today,
      shift: d.shift,
      plant: d.plant,
      machine: d.machine || '',
      operator: d.operator || '',
      operator2: d.operator2 || '',
      product: d.product || '',
      mould: d.mould || '',
      cavities: parseFloat(d.cavities) || 0,
      cycle_time: parseFloat(d.cycleTime) || 0,
      material: d.material || '',
      good_parts: Math.round(totalGood),
      rejection: Math.round(totalRej),
      downtime: Math.round(totalDown),
      shots_this_shift: shotsThisShift,
      machine_status: d.machineStatus || 'running',
      stop_reason: d.stopReason || '',
      remarks: d.remarks || '',
      entered_by: d.enteredBy || ''
    })
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, msg: error.message })

  // Save slots
  if (prod && slots.length > 0) {
    const slotRows = slots.map((s: any) => ({
      production_id: prod.id,
      slot_name: s.slot || '',
      good_parts: parseFloat(s.good) || 0,
      rejection: parseFloat(s.rejection) || 0,
      downtime: parseFloat(s.down) || 0,
      remarks: s.remarks || ''
    }))
    await supabase.from('production_slots').insert(slotRows)
  }

  // Update mould shot counter
  if (d.mould && shotsThisShift > 0) {
    const { data: mould } = await supabase
      .from('mould_master')
      .select('*')
      .ilike('mould_name', `%${d.mould.split(' - ')[0]}%`)
      .maybeSingle()

    if (mould && mould.pm_frequency_shots > 0) {
      const newShots = (mould.current_shots || 0) + shotsThisShift
      const remaining = (mould.next_pm_at_shots || 0) - newShots
      const pct10 = mould.pm_frequency_shots * 0.1
      const newStatus = remaining <= 0 ? 'OVERDUE' : remaining < pct10 ? 'DUE SOON' : 'Active'
      await supabase.from('mould_master').update({ current_shots: newShots, status: newStatus }).eq('id', mould.id)
    }
  }

  return NextResponse.json({
    success: true,
    msg: `Production saved! Good: ${Math.round(totalGood).toLocaleString()} | Rej: ${Math.round(totalRej).toLocaleString()}`
  })
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const { data } = await supabase.from('production').select('*').eq('date', date).order('created_at', { ascending: false })
  return NextResponse.json({ success: true, data: data || [] })
}
