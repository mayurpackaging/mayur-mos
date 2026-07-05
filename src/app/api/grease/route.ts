import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

function istToday() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000).toISOString().split('T')[0]
}

// Recalc a spare's stock from spare_movements (single source of truth)
async function recalcSpareStock(partName: string) {
  const { data: movs } = await supabase.from('spare_movements')
    .select('id,action,qty,new_stock').ilike('part_name', partName)
    .order('created_at', { ascending: true })
  let running = 0
  for (const m of (movs || [])) {
    const q = parseFloat(m.qty) || 0
    if (m.action === 'Stock In') running += q
    else running -= q
    if (running < 0) running = 0
    if ((m as any).new_stock !== running) {
      await supabase.from('spare_movements').update({ new_stock: running }).eq('id', m.id)
    }
  }
  const { data: sp } = await supabase.from('spares_master').select('id,min_qty').ilike('part_name', partName).maybeSingle()
  if (sp) {
    const status = running === 0 ? 'Out of Stock' : running < (sp.min_qty || 0) ? 'Low' : 'OK'
    await supabase.from('spares_master').update({ current_stock: running, status, last_updated: new Date().toISOString() }).eq('id', sp.id)
  }
  return running
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const machine = searchParams.get('machine') || ''

  // grease stock from SPARES — only machine greases (JSW + Sumitomo), exclude food grease
  const { data: allGrease } = await supabase.from('spares_master').select('*').ilike('part_name', '%grease%').order('part_name')
  const allSpares = (allGrease || []).filter((s: any) => {
    const n = (s.part_name || '').toLowerCase()
    return n.includes('jsw') || n.includes('sumitomo')
  })

  // grease usage log (counter tracking) — separate table
  let logQuery = supabase.from('grease_log').select('*').order('created_at', { ascending: false }).limit(100)
  if (machine) logQuery = supabase.from('grease_log').select('*').eq('machine', machine).order('created_at', { ascending: false }).limit(100)
  const { data: logs } = await logQuery

  // per-machine last grease change
  const { data: allUsed } = await supabase.from('grease_log')
    .select('machine,plant,date,machine_counter,grease_name,qty,created_at')
    .eq('action', 'Used in Machine').order('created_at', { ascending: false })
  const lastByMachine: Record<string, any> = {}
  for (const r of (allUsed || [])) {
    if (r.machine && !lastByMachine[r.machine]) lastByMachine[r.machine] = r
  }

  // plant-wise stock — spares_master ke ACTUAL stock se (movements se nahi, woh galat ho sakta hai)
  const plantWise: Record<string, Record<string, number>> = {}
  for (const s of (allSpares || [])) {
    const gn = s.part_name
    const p = s.plant || 'No Plant'
    if (!plantWise[gn]) plantWise[gn] = {}
    plantWise[gn][p] = (plantWise[gn][p] || 0) + (parseFloat(s.current_stock) || 0)
  }

  // ── Machine-wise grease change chart (history + since_last + average) ──
  const { data: allChanges } = await supabase.from('grease_log')
    .select('machine,plant,date,machine_counter,grease_name,created_at')
    .eq('action', 'Used in Machine')
    .not('machine_counter', 'is', null)
    .order('created_at', { ascending: true })
  const byMachine: Record<string, any[]> = {}
  for (const r of (allChanges || [])) {
    if (!r.machine) continue
    const key = `${r.plant}||${r.machine}` // plant + machine (same naam do plant mein ho sakta hai)
    if (!byMachine[key]) byMachine[key] = []
    byMachine[key].push(r)
  }
  const chart: any[] = []
  for (const key of Object.keys(byMachine)) {
    const recs = byMachine[key]
    const history = recs.map((r, i) => {
      const prev = i > 0 ? recs[i - 1].machine_counter : null
      const sinceLast = (prev != null && r.machine_counter != null) ? (r.machine_counter - prev) : null
      return { date: r.date, plant: r.plant, counter: r.machine_counter, grease: r.grease_name, sinceLast }
    })
    const gaps = history.map(h => h.sinceLast).filter(x => x != null && x > 0) as number[]
    const avg = gaps.length > 0 ? Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length) : null
    const last = history[history.length - 1]
    chart.push({
      machine: recs[0].machine, plant: recs[0].plant,
      changes: history.length,
      lastCounter: last?.counter, lastDate: last?.date,
      lastSinceLast: last?.sinceLast,
      avgShots: avg, history,
    })
  }
  chart.sort((a, b) => (a.plant || '').localeCompare(b.plant || '') || a.machine.localeCompare(b.machine))

  return NextResponse.json({
    success: true,
    stock: allSpares || [],
    logs: logs || [],
    lastByMachine: Object.values(lastByMachine),
    plantWise,
    chart,
  })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = d.date || istToday()

  // ── Stock In (grease aayi) — plant-wise SPARES row ──
  if (d.type === 'stock_in') {
    const qty = parseFloat(d.qty) || 0
    if (!d.greaseName || qty <= 0) return NextResponse.json({ success: false, msg: 'Grease aur qty daalo!' })
    const plant = d.plant || 'Plant 477'
    // us plant ka grease row dhoondo (part_name + plant)
    let { data: sp } = await supabase.from('spares_master').select('*')
      .ilike('part_name', d.greaseName).eq('plant', plant).maybeSingle()
    // agar us plant mein nahi hai, kisi bhi plant ka row le ke uska template banao
    if (!sp) {
      const { data: any1 } = await supabase.from('spares_master').select('*').ilike('part_name', d.greaseName).limit(1).maybeSingle()
      if (!any1) return NextResponse.json({ success: false, msg: 'Yeh grease spares mein nahi hai!' })
      // naya plant-wise row banao
      const { data: created } = await supabase.from('spares_master').insert({
        part_name: any1.part_name, category: any1.category || '', unit: any1.unit || 'Pcs',
        min_qty: any1.min_qty || 0, current_stock: 0, status: 'Active',
        plant, storage_type: any1.storage_type || '',
      }).select().maybeSingle()
      sp = created
    }
    if (!sp) return NextResponse.json({ success: false, msg: 'Row banane mein dikkat' })

    await supabase.from('spare_movements').insert({
      date: today, slip_no: '', vendor: d.vendor || '',
      part_name: sp.part_name, category: sp.category || '',
      action: 'Stock In', qty, price_per_pc: parseFloat(d.price) || 0,
      total_price: qty * (parseFloat(d.price) || 0),
      done_by: d.doneBy || '', new_stock: 0,
      plant, machine: '', used_for: '',
    })
    // us plant ke row ka stock badhao
    const newStock = (parseFloat(sp.current_stock) || 0) + qty
    await supabase.from('spares_master').update({ current_stock: newStock, last_updated: today, last_vendor: d.vendor || sp.last_vendor })
      .eq('id', sp.id)
    return NextResponse.json({ success: true, msg: `${plant} mein Stock In! Naya stock: ${newStock}` })
  }

  // ── Used in Machine (grease change) — SPARES stock minus + grease_log counter ──
  if (d.type === 'used') {
    const qty = parseFloat(d.qty) || 0
    if (!d.greaseName || !d.machine || qty <= 0) return NextResponse.json({ success: false, msg: 'Grease, machine aur qty daalo!' })
    const plant = d.plant || 'Plant 477'
    // us plant ka grease row (na mile toh koi bhi)
    let { data: sp } = await supabase.from('spares_master').select('*')
      .ilike('part_name', d.greaseName).eq('plant', plant).maybeSingle()
    if (!sp) { const { data: any1 } = await supabase.from('spares_master').select('*').ilike('part_name', d.greaseName).limit(1).maybeSingle(); sp = any1 }
    if (!sp) return NextResponse.json({ success: false, msg: 'Yeh grease spares mein nahi hai!' })

    const counter = d.machineCounter != null && d.machineCounter !== '' ? parseFloat(d.machineCounter) : null
    // since_last for this machine
    let sinceLast: number | null = null
    if (counter != null) {
      const { data: lastUse } = await supabase.from('grease_log')
        .select('machine_counter').eq('machine', d.machine).eq('action', 'Used in Machine')
        .not('machine_counter', 'is', null).order('created_at', { ascending: false }).limit(1)
      const prev = lastUse?.[0]?.machine_counter
      if (prev != null) sinceLast = Math.max(0, counter - prev)
    }

    // 1. reduce spares stock via spare_movements
    await supabase.from('spare_movements').insert({
      date: today, slip_no: '', vendor: '',
      part_name: sp.part_name, category: sp.category || '',
      action: 'Used in Machine', qty, price_per_pc: 0, total_price: 0,
      done_by: d.doneBy || '', new_stock: 0,
      plant, machine: d.machine, used_for: 'Machine',
    })
    // us plant ke row ka stock ghatao
    const ns = Math.max((parseFloat(sp.current_stock) || 0) - qty, 0)
    await supabase.from('spares_master').update({ current_stock: ns, last_updated: today }).eq('id', sp.id)

    // 2. counter record in grease_log
    await supabase.from('grease_log').insert({
      date: today, action: 'Used in Machine', grease_name: sp.part_name, qty,
      machine: d.machine, plant: d.plant || '',
      machine_counter: counter, since_last: sinceLast,
      new_stock: ns, done_by: d.doneBy || '', vendor: '', remarks: d.remarks || '',
    })

    return NextResponse.json({ success: true, msg: `Grease change record ho gaya! Stock: ${ns}` })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const logId = searchParams.get('log_id')
  if (logId) {
    const { data: l } = await supabase.from('grease_log').select('grease_name,machine,date,qty').eq('id', logId).maybeSingle()
    // delete the grease_log row
    await supabase.from('grease_log').delete().eq('id', logId)
    // also remove matching spare_movement (best-effort: same part+machine+date+qty, latest)
    if (l) {
      const { data: mv } = await supabase.from('spare_movements')
        .select('id').ilike('part_name', l.grease_name).eq('machine', l.machine)
        .eq('date', l.date).eq('action', 'Used in Machine').eq('qty', l.qty)
        .order('created_at', { ascending: false }).limit(1)
      if (mv && mv[0]) await supabase.from('spare_movements').delete().eq('id', mv[0].id)
      await recalcSpareStock(l.grease_name)
    }
    return NextResponse.json({ success: true, msg: 'Record deleted & stock theek!' })
  }
  return NextResponse.json({ success: false, msg: 'ID required' })
}
