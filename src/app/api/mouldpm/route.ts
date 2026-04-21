import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
export async function GET() {
  const { data: moulds } = await supabase.from('mould_master').select('*').order('mould_name')
  const result = (moulds || []).map((m:any) => {
    const curr = m.current_shots || 0
    const pmAt = m.next_pm_at_shots || 0
    const freq = m.pm_frequency_shots || 0
    const remaining = pmAt - curr
    const pct = pmAt > 0 ? Math.round(curr / pmAt * 100) : 0
    const status = remaining <= 0 ? 'OVERDUE' : remaining < freq * 0.1 ? 'DUE SOON' : 'Active'
    return { ...m, remaining, pct, status }
  })
  return NextResponse.json({ success: true, moulds: result })
}
export async function POST(req: Request) {
  const d = await req.json()
  if (d.action === 'setup') {
    const freq = parseFloat(d.pmShots) || 0
    const curr = parseFloat(d.currentShots) || 0
    const nextPM = curr + freq
    const { data: existing } = await supabase.from('mould_master').select('id').ilike('mould_name', d.mouldName).maybeSingle()
    if (existing) {
      await supabase.from('mould_master').update({ pm_frequency_shots: freq, current_shots: curr, next_pm_at_shots: nextPM, plant: d.plant, machine: d.machine }).eq('id', existing.id)
    } else {
      await supabase.from('mould_master').insert({ mould_name: d.mouldName, pm_frequency_shots: freq, current_shots: curr, next_pm_at_shots: nextPM, plant: d.plant, machine: d.machine })
    }
    return NextResponse.json({ success: true, msg: `PM set! Next at ${nextPM.toLocaleString()} shots` })
  }
  if (d.action === 'done') {
    const shots = parseFloat(d.currentShots) || 0
    const freq = parseFloat(d.pmFrequency) || 0
    const nextPM = shots + freq
    await supabase.from('pm_logs').insert({ date: d.pmDate, mould_name: d.mouldName, plant: d.plant || '', done_by: d.doneBy, current_shots: shots, next_pm_shots: nextPM, pm_frequency: freq, overall_result: d.overallResult, ng_count: d.ngCount || 0, correction: d.correction || '', checks: d.checks || {} })
    await supabase.from('mould_master').update({ current_shots: shots, next_pm_at_shots: nextPM, status: 'Active' }).ilike('mould_name', d.mouldName)
    return NextResponse.json({ success: true, msg: `PM saved! Next at ${nextPM.toLocaleString()} shots` })
  }
  return NextResponse.json({ success: false, msg: 'Unknown action' })
}
