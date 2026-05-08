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
  const frequency = searchParams.get('frequency') || 'Daily'

  let q = supabase.from('maintenance_logs').select('*')
    .eq('date', date).eq('frequency', frequency)
  if (machine) q = q.eq('machine', machine)
  const { data } = await q.order('created_at', { ascending: false })

  // Get shot counters
  const { data: shots } = await supabase.from('machine_shots')
    .select('*').eq('date', date).order('machine')

  return NextResponse.json({ success: true, data: data || [], shots: shots || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  if (d.type === 'checklist') {
    const rows = (d.items || []).map((item: any) => ({
      date: d.date || today,
      frequency: d.frequency,
      plant: d.plant,
      machine: d.machine,
      machine_type: d.machineType || 'All Electric',
      section: item.section,
      check_point: item.checkPoint,
      result: item.result || 'Pending',
      remarks: item.remarks || '',
      done_by: d.doneBy
    }))
    if (rows.length === 0) return NextResponse.json({ success: false, msg: 'Koi item nahi!' })
    
    // Delete existing entries for same date+machine+frequency
    await supabase.from('maintenance_logs')
      .delete()
      .eq('date', d.date || today)
      .eq('machine', d.machine)
      .eq('frequency', d.frequency)
    
    const { error } = await supabase.from('maintenance_logs').insert(rows)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: `${rows.length} checklist items saved!` })
  }

  if (d.type === 'shots') {
    const shots = d.shots || []
    for (const s of shots) {
      if (!s.machine) continue
      await supabase.from('machine_shots').upsert({
        date: d.date || today,
        shift: d.shift,
        plant: d.plant,
        machine: s.machine,
        product: s.product || '',
        mould: s.mould || '',
        start_counter: parseFloat(s.startCounter) || 0,
        end_counter: parseFloat(s.endCounter) || 0,
        shots_this_shift: (parseFloat(s.endCounter) || 0) - (parseFloat(s.startCounter) || 0),
        total_counter: parseFloat(s.totalCounter) || 0,
        done_by: d.doneBy
      }, { onConflict: 'date,machine,shift' })
    }
    return NextResponse.json({ success: true, msg: 'Shot counters saved!' })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
