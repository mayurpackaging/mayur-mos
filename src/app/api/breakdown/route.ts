import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  
  const { data: recent } = await supabase
    .from('breakdowns')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(15)

  const { data: pending } = await supabase
    .from('breakdowns')
    .select('*')
    .eq('status', 'Pending')
    .order('created_at', { ascending: true })

  const { data: todayData } = await supabase
    .from('breakdowns')
    .select('downtime_min')
    .eq('date', today)

  const totalDowntime = todayData?.reduce((a, r) => a + (r.downtime_min || 0), 0) || 0

  return NextResponse.json({
    success: true,
    recent: recent || [],
    pending: pending || [],
    totalBreakdowns: recent?.length || 0,
    totalDowntime: Math.round(totalDowntime)
  })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]
  
  if (d.action === 'report') {
    // Generate BD ID
    const { count } = await supabase.from('breakdowns').select('*', { count: 'exact', head: true })
    const plantCode = (d.plant || '').replace('Plant ', '')
    const dateStr = new Date().toLocaleDateString('en-GB').split('/').reverse().join('').slice(2)
    const serial = String((count || 0) + 1).padStart(3, '0')
    const bdId = `BD-${plantCode}-${dateStr}-${serial}`
    const timeOfCall = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

    const { error } = await supabase.from('breakdowns').insert({
      bd_id: bdId,
      date: today,
      shift: d.shift,
      plant: d.plant,
      machine: d.machine,
      operator_name: d.operatorName,
      problem: d.problem,
      category: d.category,
      mould_running: d.mouldRunning || '',
      time_of_call: timeOfCall,
      status: 'Pending',
      reported_by: d.reportedBy
    })

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, bdId, timeOfCall, msg: `Breakdown reported! ID: ${bdId}` })
  }

  if (d.action === 'resolve') {
    const { data: bd } = await supabase
      .from('breakdowns')
      .select('time_of_call')
      .eq('bd_id', d.bdId)
      .single()

    let downtime = 0
    if (bd?.time_of_call && d.workFinishTime) {
      const [ch, cm] = bd.time_of_call.split(':').map(Number)
      const [fh, fm] = d.workFinishTime.split(':').map(Number)
      downtime = Math.round((fh * 60 + fm) - (ch * 60 + cm))
      if (downtime < 0) downtime += 24 * 60
    }

    const { error } = await supabase
      .from('breakdowns')
      .update({
        reporting_time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        analysis: d.analysis,
        action_taken: d.actionTaken,
        spares_used: d.sparesUsed,
        resolved_by: d.resolvedBy,
        work_finish_time: d.workFinishTime,
        downtime_min: downtime,
        status: d.result || 'Resolved',
        remarks: d.remarks
      })
      .eq('bd_id', d.bdId)

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, downtime, msg: `Resolved! Downtime: ${downtime} min` })
  }

  return NextResponse.json({ success: false, msg: 'Unknown action' })
}
