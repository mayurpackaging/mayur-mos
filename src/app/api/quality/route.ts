import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const report = searchParams.get('report') || ''

  if (report) {
    // Report mode — date range
    const fromDate = from || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0]
    const toDate = to || new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('quality_checks')
      .select('*')
      .gte('date', fromDate)
      .lte('date', toDate)
      .order('date', { ascending: false })
      .order('check_time', { ascending: true })
    return NextResponse.json({ success: true, data: data || [] })
  }

  // Default — today
  const { data } = await supabase
    .from('quality_checks')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const { entries } = await req.json()
  if (!entries || entries.length === 0) return NextResponse.json({ success: false, msg: 'Koi entry nahi!' })
  const { error } = await supabase.from('quality_checks').insert(entries)
  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: entries.length + ' machines quality saved!' })
}
