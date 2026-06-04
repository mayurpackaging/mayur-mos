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

// Recalculate stock for a grease from all its log entries (single source of truth)
async function recalcStock(greaseName: string) {
  const { data: logs } = await supabase.from('grease_log')
    .select('id,action,qty,new_stock').ilike('grease_name', greaseName)
    .order('created_at', { ascending: true })
  let running = 0
  for (const m of (logs || [])) {
    const q = parseFloat(m.qty) || 0
    if (m.action === 'Stock In') running += q
    else running -= q
    if (running < 0) running = 0
    if ((m as any).new_stock !== running) {
      await supabase.from('grease_log').update({ new_stock: running }).eq('id', m.id)
    }
  }
  const { data: g } = await supabase.from('grease_stock').select('id').ilike('grease_name', greaseName).maybeSingle()
  if (g) await supabase.from('grease_stock').update({ current_stock: running }).eq('id', g.id)
  return running
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const machine = searchParams.get('machine') || ''

  // grease types + stock
  const { data: stock } = await supabase.from('grease_stock').select('*').order('grease_name')

  // recent log (or machine-specific)
  let logQuery = supabase.from('grease_log').select('*').order('created_at', { ascending: false }).limit(100)
  if (machine) logQuery = supabase.from('grease_log').select('*').eq('machine', machine).order('created_at', { ascending: false }).limit(100)
  const { data: logs } = await logQuery

  // per-machine last grease change (latest "Used in Machine" per machine)
  const { data: allUsed } = await supabase.from('grease_log')
    .select('machine,plant,date,machine_counter,grease_name,qty,created_at')
    .eq('action', 'Used in Machine').order('created_at', { ascending: false })
  const lastByMachine: Record<string, any> = {}
  for (const r of (allUsed || [])) {
    if (r.machine && !lastByMachine[r.machine]) lastByMachine[r.machine] = r
  }

  return NextResponse.json({
    success: true,
    stock: stock || [],
    logs: logs || [],
    lastByMachine: Object.values(lastByMachine),
  })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = d.date || istToday()

  // ── Add new grease type ──
  if (d.type === 'new_grease') {
    const { error } = await supabase.from('grease_stock').insert({
      grease_name: d.greaseName, unit: d.unit || 'kg',
      current_stock: 0, min_qty: parseFloat(d.minQty) || 0,
      last_vendor: d.vendor || '', last_price: parseFloat(d.price) || 0,
    })
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Grease type added!' })
  }

  // ── Stock In (grease aayi) ──
  if (d.type === 'stock_in') {
    const qty = parseFloat(d.qty) || 0
    if (!d.greaseName || qty <= 0) return NextResponse.json({ success: false, msg: 'Grease aur qty daalo!' })
    // update meta
    const { data: g } = await supabase.from('grease_stock').select('*').ilike('grease_name', d.greaseName).maybeSingle()
    if (g) {
      await supabase.from('grease_stock').update({
        last_vendor: d.vendor || g.last_vendor,
        last_price: parseFloat(d.price) > 0 ? parseFloat(d.price) : g.last_price,
      }).eq('id', g.id)
    }
    await supabase.from('grease_log').insert({
      date: today, action: 'Stock In', grease_name: d.greaseName, qty,
      machine: '', plant: d.plant || '', machine_counter: null, since_last: null,
      new_stock: 0, done_by: d.doneBy || '', vendor: d.vendor || '', remarks: d.remarks || '',
    })
    const ns = await recalcStock(d.greaseName)
    return NextResponse.json({ success: true, msg: `Stock In ho gaya! Naya stock: ${ns}` })
  }

  // ── Used in Machine (grease change) ──
  if (d.type === 'used') {
    const qty = parseFloat(d.qty) || 0
    if (!d.greaseName || !d.machine || qty <= 0) return NextResponse.json({ success: false, msg: 'Grease, machine aur qty daalo!' })
    const counter = d.machineCounter != null && d.machineCounter !== '' ? parseFloat(d.machineCounter) : null

    // since_last = current counter - last change counter for this machine
    let sinceLast: number | null = null
    if (counter != null) {
      const { data: lastUse } = await supabase.from('grease_log')
        .select('machine_counter').eq('machine', d.machine).eq('action', 'Used in Machine')
        .not('machine_counter', 'is', null)
        .order('created_at', { ascending: false }).limit(1)
      const prev = lastUse?.[0]?.machine_counter
      if (prev != null) sinceLast = Math.max(0, counter - prev)
    }

    await supabase.from('grease_log').insert({
      date: today, action: 'Used in Machine', grease_name: d.greaseName, qty,
      machine: d.machine, plant: d.plant || '',
      machine_counter: counter, since_last: sinceLast,
      new_stock: 0, done_by: d.doneBy || '', vendor: '', remarks: d.remarks || '',
    })
    const ns = await recalcStock(d.greaseName)
    return NextResponse.json({ success: true, msg: `Grease change record ho gaya! Stock: ${ns}` })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const logId = searchParams.get('log_id')
  if (logId) {
    const { data: l } = await supabase.from('grease_log').select('grease_name').eq('id', logId).maybeSingle()
    const { error } = await supabase.from('grease_log').delete().eq('id', logId)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    if (l && l.grease_name) await recalcStock(l.grease_name)
    return NextResponse.json({ success: true, msg: 'Record deleted & stock theek!' })
  }
  return NextResponse.json({ success: false, msg: 'ID required' })
}
