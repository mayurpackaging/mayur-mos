import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || ''

  let q = supabase.from('breakdowns').select('*').order('created_at', { ascending: false }).limit(100)
  if (date) q = q.eq('date', date)

  const { data } = await q
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  // Report new breakdown
  if (d.type === 'report') {
    const now = new Date().toISOString()
    const { data: bd, error } = await supabase.from('breakdowns').insert({
      date: d.date || today,
      plant: d.plant || '',
      machine: d.machine || '',
      problem: d.problem || '',
      category: d.category || 'Mechanical',
      operator_name: d.operator || '',
      reported_time: now,
      status: 'Pending',
      reported_by: d.enteredBy || '',
      remarks: d.remarks || ''
    }).select().single()

    if (error) return NextResponse.json({ success: false, msg: error.message })

    // Send alert email if configured
    try {
      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'breakdown', breakdown: bd })
      })
    } catch(e) {}

    return NextResponse.json({ success: true, msg: 'Breakdown reported! Alert sent.' })
  }

  // Mark work started
  if (d.type === 'start_work') {
    const { error } = await supabase.from('breakdowns').update({
      work_started_time: new Date().toISOString(),
      status: 'In Progress'
    }).eq('id', d.id)

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Work started — time stamp saved!' })
  }

  // Resolve breakdown
  if (d.type === 'resolve') {
    const resolvedTime = new Date().toISOString()

    // Get reported time for downtime calculation
    const { data: bd } = await supabase.from('breakdowns').select('reported_time, work_started_time').eq('id', d.id).single()
    const reportedTime = bd?.reported_time || resolvedTime
    const downtimeMins = Math.round((new Date(resolvedTime).getTime() - new Date(reportedTime).getTime()) / 60000)

    const { error } = await supabase.from('breakdowns').update({
      resolved_time: resolvedTime,
      status: 'Resolved',
      solution: d.solution || '',
      downtime_min: downtimeMins,
      resolved_by: d.enteredBy || '',
      remarks: d.remarks || ''
    }).eq('id', d.id)

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: `Resolved! Downtime: ${downtimeMins} min` })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
