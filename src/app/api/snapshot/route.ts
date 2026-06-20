import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// All machines per plant (must match MACH in page.tsx)
const MACH: Record<string, string[]> = {
  'Plant 477': ['M1-Sumitomo 180T','M2-Sumitomo 180T','M3-Sumitomo 180T','M4-Sumitomo 280T','M5-JSW 180T','M6-Sumitomo 180T'],
  'Plant 488': ['M1-Sumitomo 180T','M2-Sumitomo 180T','M3-JSW 350T','M4-Sumitomo 180T','M5-Sumitomo 350T','M6-JSW 350T','M7-JSW 350T'],
  'Plant 433': ['M1-Milacron N200T','M2-Milacron N200T'],
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const date = searchParams.get('date') || new Date().toISOString().slice(0, 10)

    // ─── 1. PRODUCTION HEALTH ───
    const { data: prod } = await supabase.from('production')
      .select('machine,shift,plant,product,good_parts,rejection,downtime,cycle_time,cavities,machine_status,remarks')
      .eq('date', date)

    const plants = ['Plant 477', 'Plant 488', 'Plant 433']
    const prodHealth: any[] = []
    let totalGood = 0, totalProj = 0, totalRej = 0

    for (const plant of plants) {
      const pp = (prod || []).filter(p => p.plant === plant)
      if (pp.length === 0) continue
      const machinesRun = new Set(pp.map(p => p.machine))
      const allMachines = MACH[plant] || []
      const notRunning = allMachines.filter(m => !machinesRun.has(m))
      const good = pp.reduce((a, p) => a + (p.good_parts || 0), 0)
      const rej = pp.reduce((a, p) => a + (p.rejection || 0), 0)
      const proj = pp.reduce((a, p) => {
        const ct = parseFloat(p.cycle_time as any) || 0, cav = parseInt(p.cavities as any) || 0
        return ct > 0 && cav > 0 ? a + Math.round(43200 / ct * cav) : a
      }, 0)
      totalGood += good; totalProj += proj; totalRej += rej
      prodHealth.push({
        plant,
        machinesRun: machinesRun.size,
        totalMachines: allMachines.length,
        notRunning,
        good, rej,
        eff: proj > 0 ? Math.round(good / proj * 100) : 0,
      })
    }
    const overallEff = totalProj > 0 ? Math.round(totalGood / totalProj * 100) : 0

    // ─── 2. PROBLEMS (high rejection / low efficiency entries) ───
    const problems: any[] = []
    for (const p of (prod || [])) {
      const good = p.good_parts || 0, rej = p.rejection || 0
      const rejPct = good + rej > 0 ? (rej / (good + rej) * 100) : 0
      if (rejPct > 3) problems.push({ type: 'rejection', machine: p.machine, plant: p.plant, product: p.product, detail: `${rejPct.toFixed(1)}% rejection (${rej} pc)` })
      const ct = parseFloat(p.cycle_time as any) || 0, cav = parseInt(p.cavities as any) || 0
      if (ct > 0 && cav > 0) {
        const proj = Math.round(43200 / ct * cav)
        const eff = proj > 0 ? Math.round(good / proj * 100) : 0
        if (eff < 70 && good > 0) problems.push({ type: 'loweff', machine: p.machine, plant: p.plant, product: p.product, detail: `Sirf ${eff}% efficiency` })
      }
    }

    // ─── 3. BREAKDOWNS (today) ───
    const { data: bds } = await supabase.from('breakdowns')
      .select('machine,plant,problem,category,downtime_min,status,shift,operator_name')
      .eq('date', date)
      .order('created_at', { ascending: false })
    const breakdowns = (bds || []).map(b => ({
      machine: b.machine, plant: b.plant,
      problem: b.problem || b.category || '-',
      time: b.downtime_min || 0,
      status: b.status,
    }))

    // ─── 4. SPARES MOVEMENT (today) ───
    const { data: moves } = await supabase.from('spare_movements')
      .select('part_name,action,qty,machine,plant,vendor')
      .eq('date', date)
      .order('created_at', { ascending: false })
    const stockIn = (moves || []).filter(m => m.action === 'Stock In').map(m => ({ part: m.part_name, qty: m.qty, vendor: m.vendor }))
    const used = (moves || []).filter(m => m.action !== 'Stock In').map(m => ({ part: m.part_name, qty: m.qty, machine: m.machine, plant: m.plant }))

    // ─── 5. PENDING ───
    const { data: pendBd } = await supabase.from('breakdowns').select('id').eq('status', 'Pending')
    const { data: pendQc } = await supabase.from('qc_alerts').select('id').eq('status', 'Pending')
    const { data: pmLogs } = await supabase.from('pm_logs').select('mould_name,current_shots,next_pm_shots')
    const pmOverdue = (pmLogs || []).filter(p => (p.current_shots || 0) >= (p.next_pm_shots || 999999999)).length

    const pending = {
      breakdowns: (pendBd || []).length,
      qcAlerts: (pendQc || []).length,
      pmOverdue,
    }

    return NextResponse.json({
      success: true, date,
      production: { plants: prodHealth, totalGood, totalProj, overallEff, totalRej },
      problems,
      breakdowns,
      spares: { stockIn, used },
      pending,
    })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
