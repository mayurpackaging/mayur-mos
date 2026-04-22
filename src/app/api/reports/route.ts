import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const module = searchParams.get('module') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''
  const plant = searchParams.get('plant') || ''

  if (!from || !to) return NextResponse.json({ success: false, msg: 'Date range required' })

  if (module === 'ims') {
    let q = supabase.from('ims_stock').select('*').gte('date', from).lte('date', to).order('date', { ascending: false })
    if (plant) q = q.eq('plant', plant)
    const { data, error } = await q
    if (error) return NextResponse.json({ success: false, msg: error.message })
    const byDate: Record<string, any[]> = {}
    data?.forEach(r => { if (!byDate[r.date]) byDate[r.date] = []; byDate[r.date].push(r) })
    return NextResponse.json({ success: true, data: data || [], byDate })
  }

  if (module === 'production') {
    let q = supabase.from('production').select('*').gte('date', from).lte('date', to).order('date', { ascending: false })
    if (plant) q = q.eq('plant', plant)
    const { data, error } = await q
    if (error) return NextResponse.json({ success: false, msg: error.message })
    const totalGood = data?.reduce((a, r) => a + (r.good_parts || 0), 0) || 0
    const totalRej = data?.reduce((a, r) => a + (r.rejection || 0), 0) || 0
    const totalDown = data?.reduce((a, r) => a + (r.downtime || 0), 0) || 0
    const totalParts = totalGood + totalRej
    const avgEff = totalParts > 0 ? Math.round(totalGood / totalParts * 100) : 0
    const byDate: Record<string, any> = {}
    data?.forEach(r => {
      if (!byDate[r.date]) byDate[r.date] = { date: r.date, good: 0, rej: 0, down: 0, entries: 0 }
      byDate[r.date].good += r.good_parts || 0
      byDate[r.date].rej += r.rejection || 0
      byDate[r.date].down += r.downtime || 0
      byDate[r.date].entries++
    })
    return NextResponse.json({ success: true, data: data || [], summary: { totalGood, totalRej, totalDown, avgEff, entries: data?.length || 0 }, byDate: Object.values(byDate).sort((a: any, b: any) => b.date.localeCompare(a.date)) })
  }

  if (module === 'breakdown') {
    let q = supabase.from('breakdowns').select('*').gte('date', from).lte('date', to).order('date', { ascending: false })
    if (plant) q = q.eq('plant', plant)
    const { data, error } = await q
    if (error) return NextResponse.json({ success: false, msg: error.message })
    const totalDown = data?.reduce((a, r) => a + (r.downtime_min || 0), 0) || 0
    return NextResponse.json({ success: true, data: data || [], summary: { total: data?.length || 0, totalDowntime: totalDown, avgDowntime: data?.length ? Math.round(totalDown / data.length) : 0 } })
  }

  if (module === 'mouldchange') {
    const { data, error } = await supabase.from('mould_changes').select('*').gte('date', from).lte('date', to).order('date', { ascending: false })
    if (error) return NextResponse.json({ success: false, msg: error.message })
    const onTime = data?.filter(r => r.on_time === 'Yes').length || 0
    const avgTime = data?.length ? Math.round(data.reduce((a, r) => a + (r.actual_time || 0), 0) / data.length) : 0
    return NextResponse.json({ success: true, data: data || [], summary: { total: data?.length || 0, onTime, delayed: (data?.length || 0) - onTime, avgTime } })
  }

  if (module === 'rejection') {
    let q = supabase.from('rejections').select('*').gte('date', from).lte('date', to).order('date', { ascending: false })
    if (plant) q = q.eq('plant', plant)
    const { data, error } = await q
    if (error) return NextResponse.json({ success: false, msg: error.message })
    const totalRej = data?.reduce((a, r) => a + (r.rejection_qty || 0), 0) || 0
    const byReason: Record<string, number> = {}
    data?.forEach(r => { byReason[r.reason] = (byReason[r.reason] || 0) + (r.rejection_qty || 0) })
    return NextResponse.json({ success: true, data: data || [], summary: { total: data?.length || 0, totalQty: totalRej }, byReason })
  }

  if (module === 'mouldpm') {
    const { data, error } = await supabase.from('pm_logs').select('*').gte('date', from).lte('date', to).order('date', { ascending: false })
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, data: data || [], total: data?.length || 0 })
  }

  return NextResponse.json({ success: false, msg: 'Unknown module' })
}
