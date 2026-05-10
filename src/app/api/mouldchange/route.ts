import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const pending = searchParams.get('pending') || ''

  let q = supabase.from('mould_changes').select('*')
  
  if (pending) {
    // Get in-progress entries
    q = q.eq('status', 'in_progress')
  } else {
    q = q.eq('date', date)
  }

  const { data } = await q.order('created_at', { ascending: false })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  // Start timer - create new in_progress entry
  if (d.type === 'start') {
    const { data, error } = await supabase.from('mould_changes').insert({
      date: d.date || today,
      shift: d.shift || '',
      plant: d.plant || '',
      machine: d.machine || '',
      old_mould: d.oldMould || '',
      new_mould: d.newMould || '',
      operator: d.operator || '',
      helper: d.helper || '',
      start_time: new Date().toISOString(),
      status: 'in_progress',
      spray_done: false,
    estimated_time: d.estimatedTime || 0,
      entered_by: d.enteredBy || ''
    }).select().single()

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Timer started!', id: data.id })
  }

  // Update step - spray/load/run
  if (d.type === 'update_step') {
    const update: any = {}
    if (d.step === 'spray') { update.spray_time = new Date().toISOString(); update.spray_done = true }
    if (d.step === 'spray_skip') { update.spray_done = false }
    if (d.step === 'load') { update.load_time = new Date().toISOString() }
    if (d.step === 'run') {
      update.run_time = new Date().toISOString()
      update.status = 'complete'
      // Calculate total minutes
      const { data: entry } = await supabase.from('mould_changes').select('start_time').eq('id', d.id).single()
      if (entry?.start_time) {
        const mins = Math.round((Date.now() - new Date(entry.start_time).getTime()) / 60000)
        update.total_minutes = mins
        update.actual_time = mins
      }
    }
    update.remarks = d.remarks || ''

    const { error } = await supabase.from('mould_changes').update(update).eq('id', d.id)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: d.step === 'run' ? 'Mould Change Complete!' : 'Step saved!' })
  }

  // Full save (legacy)
  if (d.type === 'full') {
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
      actual_time: totalMin,
      spray_done: d.sprayDone || false,
      remarks: d.remarks || '',
      entered_by: d.enteredBy || '',
      status: 'complete'
    })
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: `Mould change saved! Total: ${totalMin} min` })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
