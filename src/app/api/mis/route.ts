import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const today = new Date().toISOString().split('T')[0]

  // Production today
  const { data: prodData } = await supabase.from('production').select('*').eq('date', today)

  const plants: Record<string, any> = {
    '477': {good:0,rej:0,entries:0,dayGood:0,nightGood:0},
    '488': {good:0,rej:0,entries:0,dayGood:0,nightGood:0},
    '433': {good:0,rej:0,entries:0,dayGood:0,nightGood:0}
  }
  let totalGood=0, totalRej=0, totalEntries=0
  let dayGoodTotal=0, dayRejTotal=0, nightGoodTotal=0, nightRejTotal=0
  const shiftTrack: Record<string, boolean> = {}
  const machineWise: any[] = []
  const productMap: Record<string, number> = {}

  prodData?.forEach(r => {
    const p = (r.plant||'').replace('Plant ','')
    if (plants[p]) {
      plants[p].good += r.good_parts||0
      plants[p].rej += r.rejection||0
      plants[p].entries++
      const total = (r.good_parts||0) + (r.rejection||0)
      plants[p].eff = total > 0 ? Math.round(plants[p].good/(plants[p].good+plants[p].rej)*100) : 0
    }
    totalGood += r.good_parts||0
    totalRej += r.rejection||0
    totalEntries++
    shiftTrack[`${p}-${r.shift}`] = true

    // Shift comparison
    if (r.shift?.includes('Day')) { dayGoodTotal += r.good_parts||0; dayRejTotal += r.rejection||0 }
    else { nightGoodTotal += r.good_parts||0; nightRejTotal += r.rejection||0 }

    // Machine-wise
    const totalParts = (r.good_parts||0) + (r.rejection||0)
    const eff = totalParts > 0 ? Math.round((r.good_parts||0)/totalParts*100) : 0
    machineWise.push({
      plant: r.plant, machine: r.machine, product: r.product,
      good: r.good_parts||0, rej: r.rejection||0, eff,
      shift: r.shift?.includes('Day')?'Day':'Night'
    })

    // Top products
    if (r.product) productMap[r.product] = (productMap[r.product]||0) + (r.good_parts||0)
  })

  // Calculate plant efficiency
  Object.keys(plants).forEach(p => {
    const total = plants[p].good + plants[p].rej
    plants[p].eff = total > 0 ? Math.round(plants[p].good/total*100) : 0
  })

  // Top products
  const topProducts = Object.entries(productMap)
    .map(([product, good]) => ({ product, good }))
    .sort((a, b) => b.good - a.good)
    .slice(0, 5)

  // Missing entries
  const missing: string[] = []
  ;['477','488','433'].forEach(p => {
    if (!shiftTrack[`${p}-Day (8am-8pm)`]) missing.push(`Plant ${p} — Day Shift production missing!`)
    if (!shiftTrack[`${p}-Night (8pm-8am)`]) missing.push(`Plant ${p} — Night Shift production missing!`)
  })

  // IMS last update
  const { data: imsData } = await supabase.from('ims_stock').select('date,entered_by').order('created_at',{ascending:false}).limit(1)
  const imsLastDate = imsData?.[0]?.date||''
  if (imsLastDate !== today) missing.push(`IMS Stock entry aaj nahi hui! Last: ${imsLastDate||'Never'}`)

  // Breakdown
  const { data: bdData } = await supabase.from('breakdowns').select('status,downtime_min').eq('date', today)
  const bdPending = bdData?.filter(r=>r.status==='Pending').length||0
  const bdResolved = bdData?.filter(r=>r.status!=='Pending').length||0
  const avgDowntime = bdData?.length ? Math.round(bdData.reduce((a,r)=>a+(r.downtime_min||0),0)/bdData.length) : 0

  // Mould PM
  const { data: pmData } = await supabase.from('mould_master').select('*')
  const pmOverdue = pmData?.filter(r=>r.status==='OVERDUE').length||0
  const pmDueSoon = pmData?.filter(r=>r.status==='DUE SOON').length||0
  const pmDueList = pmData?.filter(r=>r.status==='OVERDUE'||r.status==='DUE SOON').map(m => ({
    ...m,
    remaining: (m.next_pm_at_shots||0) - (m.current_shots||0),
    pct: m.next_pm_at_shots > 0 ? Math.round((m.current_shots||0)/m.next_pm_at_shots*100) : 0
  })) || []
  const shotsProgress = pmData?.sort((a,b)=>{
    const pctA = a.next_pm_at_shots > 0 ? (a.current_shots||0)/a.next_pm_at_shots : 0
    const pctB = b.next_pm_at_shots > 0 ? (b.current_shots||0)/b.next_pm_at_shots : 0
    return pctB - pctA
  }).map(m => ({...m, pct: m.next_pm_at_shots > 0 ? Math.round((m.current_shots||0)/m.next_pm_at_shots*100) : 0})) || []

  // Mould changes today
  const { data: mcData } = await supabase.from('mould_changes').select('id').eq('date', today)
  const mouldChangesToday = mcData?.length||0

  // Rejection analysis
  const { data: rejData } = await supabase.from('rejections').select('*').eq('date', today)
  const rejByReason: Record<string, number> = {}
  const rejByItemMap: Record<string, any> = {}
  let totalRejQty = 0
  rejData?.forEach(r => {
    rejByReason[r.reason] = (rejByReason[r.reason]||0) + (r.rejection_qty||0)
    if (!rejByItemMap[r.product]) rejByItemMap[r.product] = {product:r.product,qty:0,reason:r.reason,plant:r.plant}
    rejByItemMap[r.product].qty += r.rejection_qty||0
    totalRejQty += r.rejection_qty||0
  })
  const rejByReasonArr = Object.entries(rejByReason)
    .map(([reason,qty]) => ({reason,qty,pct:totalRejQty>0?Math.round(qty/totalRejQty*100):0}))
    .sort((a,b)=>b.qty-a.qty)
  const rejByItem = Object.values(rejByItemMap).sort((a:any,b:any)=>b.qty-a.qty)

  // Quality scores
  const { data: qcData } = await supabase.from('quality_checks').select('machine,part_name,overall_result').eq('date', today)
  const qualityScore = qcData?.map(q => ({
    machine: q.machine, product: q.part_name,
    ngCount: q.overall_result === 'NG' ? 1 : 0
  })) || []

  // 7-day trend
  const { data: trendData } = await supabase.from('production').select('date,good_parts,rejection')
    .gte('date', new Date(Date.now()-7*24*60*60*1000).toISOString().split('T')[0]).order('date')
  const trendMap: Record<string,any> = {}
  trendData?.forEach(r => {
    if (!trendMap[r.date]) trendMap[r.date]={date:r.date,good:0,rej:0}
    trendMap[r.date].good += r.good_parts||0
    trendMap[r.date].rej += r.rejection||0
  })
  const trend = Object.values(trendMap)

  const alerts: string[] = []
  if (pmOverdue > 0) alerts.push(`${pmOverdue} moulds PM OVERDUE!`)
  if (bdPending > 0) alerts.push(`${bdPending} breakdowns pending!`)

  return NextResponse.json({
    success: true, date: today,
    production: {
      plants, total: Math.round(totalGood), totalRej: Math.round(totalRej),
      entries: totalEntries,
      dayGood: Math.round(dayGoodTotal), dayRej: Math.round(dayRejTotal),
      nightGood: Math.round(nightGoodTotal), nightRej: Math.round(nightRejTotal)
    },
    machineWise: machineWise.sort((a,b)=>b.good-a.good),
    topProducts,
    rejByReason: rejByReasonArr,
    rejByItem,
    qualityScore,
    ims: { lastUpdated: imsLastDate, updatedBy: imsData?.[0]?.entered_by||'' },
    breakdown: { pending: bdPending, resolved: bdResolved, avgDowntime },
    mouldPM: { overdue: pmOverdue, dueSoon: pmDueSoon, ok: (pmData?.length||0)-pmOverdue-pmDueSoon },
    pmDueList,
    shotsProgress,
    mouldChangesToday,
    missing, alerts, trend
  })
}
