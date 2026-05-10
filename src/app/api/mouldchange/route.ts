import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || ''
  const pending = searchParams.get('pending') || ''
  const benchmark = searchParams.get('benchmark') || ''
  const oldMould = searchParams.get('oldMould') || ''
  const newMould = searchParams.get('newMould') || ''

  // Get benchmark for specific mould combination
  if (benchmark && oldMould && newMould) {
    const { data } = await supabase
      .from('mould_changes')
      .select('total_minutes, operator_name, entered_by, created_at')
      .eq('old_mould', oldMould)
      .eq('new_mould', newMould)
      .eq('status', 'complete')
      .gt('total_minutes', 0)
      .order('created_at', { ascending: false })
      .limit(20)

    if (!data || data.length === 0) {
      return NextResponse.json({ success: true, benchmark: null })
    }

    const times = data.map((d: any) => d.total_minutes)
    const best = Math.min(...times)
    const avg = Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length)
    const bestEntry = data.find((d: any) => d.total_minutes === best)
    const lastEntry = data[0]

    return NextResponse.json({
      success: true,
      benchmark: {
        best,
        avg,
        last: lastEntry.total_minutes,
        count: data.length,
        bestBy: bestEntry?.operator_name || bestEntry?.entered_by || '--',
        lastBy: lastEntry?.operator_name || lastEntry?.entered_by || '--',
      }
    })
  }

  // Get pending entries
  if (pending) {
    const { data } = await supabase
      .from('mould_changes')
      .select('*')
      .eq('status', 'in_progress')
      .order('created_at', { ascending: false })

    // For each pending entry, get benchmark
    const enriched = await Promise.all((data || []).map(async (entry: any) => {
      if (entry.old_mould && entry.new_mould) {
        const { data: hist } = await supabase
          .from('mould_changes')
          .select('total_minutes')
          .eq('old_mould', entry.old_mould)
          .eq('new_mould', entry.new_mould)
          .eq('status', 'complete')
          .gt('total_minutes', 0)
        
        if (hist && hist.length > 0) {
          const times = hist.map((h: any) => h.total_minutes)
          entry.benchmark_best = Math.min(...times)
          entry.benchmark_avg = Math.round(times.reduce((a: number, b: number) => a + b, 0) / times.length)
          entry.benchmark_count = hist.length
        } else {
          entry.benchmark_best = 0
        }
      }
      return entry
    }))

    return NextResponse.json({ success: true, data: enriched })
  }

  // Get history
  let q = supabase.from('mould_changes').select('*').order('created_at', { ascending: false }).limit(50)
  if (date) q = q.eq('date', date)
  const { data } = await q
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  if (d.type === 'start') {
    const { data, error } = await supabase.from('mould_changes').insert({
      date: d.date || today,
      shift: d.shift || '',
      plant: d.plant || '',
      machine: d.machine || '',
      old_mould: d.oldMould || '',
      new_mould: d.newMould || '',
      operator_name: d.operator || '',
      reporting_time: new Date().toLocaleTimeString('en-IN'),
      start_time: new Date().toISOString(),
      reported_time: new Date().toISOString(),
      status: 'in_progress',
      spray_done: false,
      estimated_min: parseFloat(d.estimatedTime) || 0,
      entered_by: d.enteredBy || ''
    }).select().single()

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Timer started!', id: data.id })
  }

  if (d.type === 'update_step') {
    const update: any = {}
    if (d.step === 'spray') { update.spray_time = new Date().toISOString(); update.spray_done = true }
    if (d.step === 'spray_skip') { update.spray_done = false }
    if (d.step === 'load') { update.load_time = new Date().toISOString() }
    if (d.step === 'run') {
      const now = new Date().toISOString()
      update.run_time = now
      update.resolved_time = now
      update.work_finish_time = new Date().toLocaleTimeString('en-IN')
      update.status = 'complete'

      const { data: entry } = await supabase.from('mould_changes').select('start_time,reported_time').eq('id', d.id).single()
      if (entry?.start_time) {
        const mins = Math.round((Date.now() - new Date(entry.start_time).getTime()) / 60000)
        update.total_minutes = mins
        update.actual_time = mins
        update.downtime_min = mins
      }
    }
    if (d.remarks) update.remarks = d.remarks

    const { error } = await supabase.from('mould_changes').update(update).eq('id', d.id)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: d.step === 'run' ? 'Mould Change Complete!' : 'Step saved!' })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
