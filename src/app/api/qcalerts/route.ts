import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const status = searchParams.get('status') || ''

  if (from && to) {
    let q = supabase.from('qc_alerts')
      .select('*').gte('date', from).lte('date', to)
      .order('date', { ascending: false })
    if (status) q = q.eq('status', status)
    const { data } = await q
    return NextResponse.json({ success: true, data: data || [] })
  }

  let q = supabase.from('qc_alerts').select('*')
    .order('created_at', { ascending: false }).limit(100)
  if (date) q = q.eq('date', date)
  if (status) q = q.eq('status', status)

  const { data } = await q
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  // IST timezone fix — UTC+5:30
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istDate = new Date(now.getTime() + istOffset)
  const today = istDate.toISOString().split('T')[0]

  // QC person reports a new alert
  if (d.type === 'report') {
    const { data: alert, error } = await supabase.from('qc_alerts').insert({
      date: d.date || today,
      check_time: d.checkTime || '',
      plant: d.plant || '',
      machine: d.machine || '',
      product: d.product || '',
      mould_name: d.mouldName || '',
      mould_code: d.mouldCode || '',
      issues: d.issues || '',
      weight_actual: d.weightActual !== undefined && d.weightActual !== '' ? Number(d.weightActual) : null,
      weight_standard: d.weightStandard !== undefined && d.weightStandard !== '' ? Number(d.weightStandard) : null,
      remarks: d.remarks || '',
      qc_person: d.qcPerson || '',
      status: 'Pending'
    }).select().single()

    if (error) return NextResponse.json({ success: false, msg: error.message })

    // Send alert email if configured
    try {
      await fetch((process.env.NEXT_PUBLIC_SITE_URL || '') + '/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'qc_alert', alert })
      })
    } catch (e) {}

    return NextResponse.json({ success: true, msg: 'QC alert reported! Operator ko bhej diya.' })
  }

  // Operator resolves the alert
  if (d.type === 'resolve') {
    const { error } = await supabase.from('qc_alerts').update({
      status: 'Resolved',
      resolved_by: d.resolvedBy || '',
      resolved_at: new Date().toISOString(),
      resolution: d.resolution || ''
    }).eq('id', d.id)

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Resolved! Action save ho gaya.' })
  }

  // Re-open a resolved alert (optional)
  if (d.type === 'reopen') {
    const { error } = await supabase.from('qc_alerts').update({
      status: 'Pending',
      resolved_by: null,
      resolved_at: null,
      resolution: null
    }).eq('id', d.id)

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Alert dobara open kar diya.' })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
