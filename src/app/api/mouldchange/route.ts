import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('mould_changes')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  const totalMin = d.totalMinutes || 0

  const { error } = await supabase.from('mould_changes').insert({
    date: d.date || today,
    shift: d.shift || '',
    plant: d.plant || '',
    machine: d.machine || '',
    old_mould: d.oldMould || '',
    new_mould: d.newMould || '',
    operator: d.operator || '',
    helper: d.helper || '',
    start_time: d.startTime || null,
    spray_time: d.sprayTime || null,
    load_time: d.loadTime || null,
    run_time: d.runTime || null,
    total_minutes: totalMin,
    spray_done: d.sprayDone || false,
    remarks: d.remarks || '',
    entered_by: d.enteredBy || ''
  })

  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: `Mould change saved! Total time: ${totalMin} min` })
}
