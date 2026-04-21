import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  // Production today
  const { data: prodData } = await supabase
    .from('production')
    .select('plant, good_parts, rejection, shift')
    .eq('date', today)

  const plants: Record<string, any> = { '477': {good:0,rej:0,entries:0}, '488': {good:0,rej:0,entries:0}, '433': {good:0,rej:0,entries:0} }
  const shiftTrack: Record<string, boolean> = {}
  let totalGood = 0, totalRej = 0, totalEntries = 0

  prodData?.forEach(r => {
    const p = (r.plant || '').replace('Plant ', '')
    if (plants[p]) {
      plants[p].good += r.good_parts || 0
      plants[p].rej += r.rejection || 0
      plants[p].entries++
    }
    totalGood += r.good_parts || 0
    totalRej += r.rejection || 0
    totalEntries++
    shiftTrack[`${p}-${r.shift}`] = true
  })

  // Missing entries
  const missing: string[] = []
  ;['477','488','433'].forEach(p => {
    if (!shiftTrack[`${p}-Day (8am-8pm)`]) missing.push(`Plant ${p} — Day Shift production missing!`)
    if (!shiftTrack[`${p}-Night (8pm-8am)`]) missing.push(`Plant ${p} — Night Shift production missing!`)
  })

  // Calc efficiency per plant
  Object.keys(plants).forEach(p => {
    const total = plants[p].good + plants[p].rej
    plants[p].eff = total > 0 ? Math.round(plants[p].good / total * 100) : 0
  })

  // IMS last update
  const { data: imsData } = await supabase
    .from('ims_stock')
    .select('date, entered_by')
    .order('created_at', { ascending: false })
    .limit(1)

  const imsLastDate = imsData?.[0]?.date || ''
  if (imsLastDate !== today) missing.push(`IMS Stock entry aaj nahi hui! Last: ${imsLastDate || 'Never'}`)

  // Breakdown today
  const { data: bdData } = await supabase.from('breakdowns').select('status, downtime_min').eq('date', today)
  const bdPending = bdData?.filter(r => r.status === 'Pending').length || 0
  const bdResolved = bdData?.filter(r => r.status !== 'Pending').length || 0
  const avgDowntime = bdData?.length ? Math.round(bdData.reduce((a,r) => a + (r.downtime_min||0), 0) / bdData.length) : 0

  // Mould PM
  const { data: pmData } = await supabase.from('mould_master').select('status')
  const pmOverdue = pmData?.filter(r => r.status === 'OVERDUE').length || 0
  const pmDueSoon = pmData?.filter(r => r.status === 'DUE SOON').length || 0
  const pmOk = pmData?.filter(r => r.status === 'Active' || r.status === 'OK').length || 0

  // 7-day trend
  const { data: trendData } = await supabase
    .from('production')
    .select('date, good_parts, rejection')
    .gte('date', new Date(Date.now() - 7*24*60*60*1000).toISOString().split('T')[0])
    .order('date')

  const trendMap: Record<string, any> = {}
  trendData?.forEach(r => {
    if (!trendMap[r.date]) trendMap[r.date] = { date: r.date, good: 0, rej: 0 }
    trendMap[r.date].good += r.good_parts || 0
    trendMap[r.date].rej += r.rejection || 0
  })
  const trend = Object.values(trendMap).map(t => ({ date: t.date, good: Math.round(t.good), rej: Math.round(t.rej) }))

  const alerts: string[] = []
  if (pmOverdue > 0) alerts.push(`${pmOverdue} moulds PM OVERDUE!`)
  if (bdPending > 0) alerts.push(`${bdPending} breakdowns pending resolution!`)

  return NextResponse.json({
    success: true,
    date: today,
    production: { plants, total: Math.round(totalGood), totalRej: Math.round(totalRej), entries: totalEntries },
    ims: { lastUpdated: imsLastDate, updatedBy: imsData?.[0]?.entered_by || '' },
    breakdown: { pending: bdPending, resolved: bdResolved, avgDowntime },
    mouldPM: { overdue: pmOverdue, dueSoon: pmDueSoon, ok: pmOk },
    missing,
    alerts,
    trend
  })
}
