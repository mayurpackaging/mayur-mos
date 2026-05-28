import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'Pending'
  const plant = searchParams.get('plant') || ''

  let q = supabase.from('qc_alerts').select('*').order('created_at', { ascending: false }).limit(50)
  if (status !== 'all') q = q.eq('status', status)
  if (plant) q = q.eq('plant', plant)

  const { data, error } = await q
  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const { alerts, type, id, resolution, resolvedBy } = await req.json()

  // Resolve alert
  if (type === 'resolve') {
    const { error } = await supabase.from('qc_alerts').update({
      status: 'Resolved',
      resolved_by: resolvedBy || '',
      resolved_at: new Date().toISOString(),
      resolution: resolution || ''
    }).eq('id', id)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Alert resolved!' })
  }

  // Create new alerts
  if (alerts && alerts.length > 0) {
    const { error } = await supabase.from('qc_alerts').insert(alerts)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: alerts.length + ' alerts created!' })
  }

  return NextResponse.json({ success: false, msg: 'Unknown request' })
}
