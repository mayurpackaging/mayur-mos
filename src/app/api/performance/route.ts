import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const operator = searchParams.get('operator') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''

  if (!operator || !from || !to) {
    return NextResponse.json({ success: false, msg: 'operator, from, to required' })
  }

  // Fetch as operator1
  const { data: prodData1 } = await supabase
    .from('production')
    .select('good_parts, rejection, downtime, machine_status')
    .eq('operator', operator)
    .gte('date', from)
    .lte('date', to)

  // Fetch as operator2
  const { data: prodData2 } = await supabase
    .from('production')
    .select('good_parts, rejection, downtime, machine_status')
    .eq('operator2', operator)
    .gte('date', from)
    .lte('date', to)

  const prodData = [...(prodData1||[]), ...(prodData2||[])]

  const totalGood = prodData.reduce((a, r) => a + (r.good_parts || 0), 0)
  const totalRej = prodData.reduce((a, r) => a + (r.rejection || 0), 0)
  const totalDown = prodData.reduce((a, r) => a + (r.downtime || 0), 0)
  const totalParts = totalGood + totalRej
  const rejPct = totalParts > 0 ? Math.round(totalRej / totalParts * 100 * 10) / 10 : 0
  const entries = prodData.length
  const avgDown = entries > 0 ? Math.round(totalDown / entries) : 0

  // Scores
  const rejScore = entries===0?0:rejPct<=0.5?10:rejPct<=1?9:rejPct<=2?7:rejPct<=3?5:rejPct<=5?3:1
  const downtimeScore = entries===0?0:avgDown===0?10:avgDown<=15?9:avgDown<=30?7:avgDown<=60?5:avgDown<=120?3:1

  // Mould Change
  const { data: mcData } = await supabase
    .from('mould_changes')
    .select('on_time')
    .eq('operator', operator)
    .gte('date', from)
    .lte('date', to)

  const mcTotal = mcData?.length || 0
  const mcOnTime = mcData?.filter(r => r.on_time === 'Yes').length || 0
  const mcOnTimePct = mcTotal > 0 ? Math.round(mcOnTime / mcTotal * 100) : null
  const mcScore = mcTotal === 0 ? null : mcOnTimePct! >= 90 ? 10 : mcOnTimePct! >= 75 ? 8 : mcOnTimePct! >= 50 ? 6 : 4

  // PM
  const { data: pmData } = await supabase
    .from('pm_logs')
    .select('overall_result')
    .eq('done_by', operator)
    .gte('date', from)
    .lte('date', to)

  const pmTotal = pmData?.length || 0
  const pmOK = pmData?.filter(r => r.overall_result === 'OK').length || 0

  return NextResponse.json({
    success: true,
    operator,
    period: { from, to },
    production: { entries, totalGood, totalRej, totalDown, rejPct, avgDown, rejScore, downtimeScore },
    mouldChange: { total: mcTotal, onTime: mcOnTime, onTimePct: mcOnTimePct, score: mcScore },
    mouldPM: { total: pmTotal, ok: pmOK, score: pmTotal===0?null:Math.round(pmOK/pmTotal*10) }
  })
}
