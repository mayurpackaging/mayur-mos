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

  // 1. Production data for this operator
  const { data: prodData } = await supabase
    .from('production')
    .select('good_parts, rejection, downtime, slots_this_shift, machine_status')
    .or(`operator.eq.${operator},operator2.eq.${operator}`)
    .gte('date', from)
    .lte('date', to)

  const totalGood = prodData?.reduce((a, r) => a + (r.good_parts || 0), 0) || 0
  const totalRej = prodData?.reduce((a, r) => a + (r.rejection || 0), 0) || 0
  const totalDown = prodData?.reduce((a, r) => a + (r.downtime || 0), 0) || 0
  const totalParts = totalGood + totalRej
  const rejPct = totalParts > 0 ? Math.round(totalRej / totalParts * 100 * 10) / 10 : 0
  const entries = prodData?.length || 0

  // Production score (0-10)
  // Based on efficiency vs expected
  const avgDown = entries > 0 ? Math.round(totalDown / entries) : 0
  const prodScore = entries === 0 ? 0 : rejPct <= 1 ? 10 : rejPct <= 2 ? 8 : rejPct <= 3 ? 6 : rejPct <= 5 ? 4 : 2

  // Rejection score (0-10)
  const rejScore = rejPct <= 0.5 ? 10 : rejPct <= 1 ? 9 : rejPct <= 2 ? 7 : rejPct <= 3 ? 5 : rejPct <= 5 ? 3 : 1

  // Downtime score (0-10)
  const downtimeScore = avgDown === 0 ? 10 : avgDown <= 15 ? 9 : avgDown <= 30 ? 7 : avgDown <= 60 ? 5 : avgDown <= 120 ? 3 : 1

  // 2. Mould Change - on time or not
  const { data: mcData } = await supabase
    .from('mould_changes')
    .select('on_time, actual_time, estimated_time')
    .eq('operator', operator)
    .gte('date', from)
    .lte('date', to)

  const mcTotal = mcData?.length || 0
  const mcOnTime = mcData?.filter(r => r.on_time === 'Yes').length || 0
  const mcOnTimePct = mcTotal > 0 ? Math.round(mcOnTime / mcTotal * 100) : null
  const mcScore = mcTotal === 0 ? null : mcOnTimePct! >= 90 ? 10 : mcOnTimePct! >= 75 ? 8 : mcOnTimePct! >= 50 ? 6 : 4

  // 3. PM done by this person
  const { data: pmData } = await supabase
    .from('pm_logs')
    .select('overall_result, ng_count')
    .eq('done_by', operator)
    .gte('date', from)
    .lte('date', to)

  const pmTotal = pmData?.length || 0
  const pmOK = pmData?.filter(r => r.overall_result === 'OK').length || 0

  return NextResponse.json({
    success: true,
    operator,
    period: { from, to },
    production: {
      entries, totalGood, totalRej, totalDown,
      rejPct, avgDown,
      prodScore, rejScore, downtimeScore
    },
    mouldChange: {
      total: mcTotal, onTime: mcOnTime,
      onTimePct: mcOnTimePct, score: mcScore
    },
    mouldPM: {
      total: pmTotal, ok: pmOK,
      score: pmTotal === 0 ? null : Math.round(pmOK / pmTotal * 10)
    }
  })
}
