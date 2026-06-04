import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

// ─── Recalculate stock for a part from ALL its movements (running total) ───
// This is the single source of truth. Stock In = +qty, everything else = -qty.
// It also rewrites new_stock on every movement row so history shows correct running stock.
async function recalcStock(partName: string) {
  // get all movements oldest-first
  const { data: movs } = await supabase.from('spare_movements')
    .select('id,action,qty,created_at')
    .ilike('part_name', partName)
    .order('created_at', { ascending: true })

  let running = 0
  for (const m of (movs || [])) {
    const q = parseFloat(m.qty) || 0
    if (m.action === 'Stock In') running += q
    else running -= q   // Used in Machine / Stock Out
    if (running < 0) running = 0
    // fix this row's new_stock if wrong
    if ((m as any).new_stock !== running) {
      await supabase.from('spare_movements').update({ new_stock: running }).eq('id', m.id)
    }
  }

  // update master current_stock
  const { data: spare } = await supabase.from('spares_master').select('id,min_qty').ilike('part_name', partName).maybeSingle()
  if (spare) {
    const status = running === 0 ? 'Out of Stock' : running < (spare.min_qty || 0) ? 'Low' : 'OK'
    await supabase.from('spares_master').update({ current_stock: running, status, last_updated: new Date().toISOString() }).eq('id', spare.id)
  }
  return running
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const part = searchParams.get('part') || ''

  if (part) {
    const { data: movements } = await supabase
      .from('spare_movements').select('*')
      .ilike('part_name', part)
      .order('created_at', { ascending: false }).limit(50)
    return NextResponse.json({ success: true, movements: movements || [] })
  }

  const { data: spares } = await supabase.from('spares_master').select('*').order('part_name')
  const { data: movements } = await supabase.from('spare_movements').select('*').order('created_at', { ascending: false }).limit(20)

  return NextResponse.json({
    success: true,
    spares: spares || [],
    recentMovements: movements || []
  })
}

export async function POST(req: Request) {
  const d = await req.json()
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istDate = new Date(now.getTime() + istOffset)
  const today = istDate.toISOString().split('T')[0]
  const items = d.items || []

  if (items.length === 0) return NextResponse.json({ success: false, msg: 'Koi item nahi!' })

  for (const item of items) {
    if (!item.partName || !item.qty) continue

    const { data: existing } = await supabase.from('spares_master').select('*').ilike('part_name', item.partName).maybeSingle()
    const qty = parseFloat(item.qty) || 0
    const price = parseFloat(item.pricePerPc) || 0

    if (existing) {
      // update meta fields (stock recalculated below)
      await supabase.from('spares_master').update({
        last_price: price > 0 ? price : existing.last_price,
        last_vendor: d.vendor || existing.last_vendor,
        plant: item.plant || existing.plant || '',
        room: item.room || existing.room || '',
        almirah: item.almirah || existing.almirah || '',
        box_no: item.boxNo || existing.box_no || '',
        storage_type: item.storageType || existing.storage_type || 'Box',
        last_updated: new Date().toISOString()
      }).eq('id', existing.id)

      await supabase.from('spare_movements').insert({
        date: d.date || today, slip_no: d.slipNo || '', vendor: d.vendor || '',
        part_name: item.partName, category: existing.category || item.category || '',
        action: d.action, qty, price_per_pc: price, total_price: qty * price,
        done_by: d.doneBy, new_stock: 0,
        plant: d.plant || '', machine: d.machine || '',
        mould_no: d.mouldNo || '', mould_name: d.mouldNo ? d.mouldNo.split('(')[0].trim() : '',
        used_for: d.usedFor || ''
      })
    } else {
      await supabase.from('spares_master').insert({
        part_name: item.partName, category: item.category || '', unit: item.unit || 'Pcs',
        min_qty: parseFloat(item.minQty) || 0, current_stock: 0,
        last_price: price, last_vendor: d.vendor || '',
        plant: item.plant || '', room: item.room || '', almirah: item.almirah || '',
        box_no: item.boxNo || '', storage_type: item.storageType || 'Box', status: 'Out of Stock'
      })

      await supabase.from('spare_movements').insert({
        date: d.date || today, slip_no: d.slipNo || '', vendor: d.vendor || '',
        part_name: item.partName, category: item.category || '',
        action: d.action, qty, price_per_pc: price, total_price: qty * price,
        done_by: d.doneBy, new_stock: 0,
        plant: d.plant || '', machine: d.machine || '',
        mould_no: d.mouldNo || '', mould_name: d.mouldNo ? d.mouldNo.split('(')[0].trim() : '',
        used_for: d.usedFor || ''
      })
    }

    // ✅ Always recalc from all movements — single source of truth
    await recalcStock(item.partName)
  }

  // If used in mould — also save to mould_history
  if (d.action === 'Used in Machine' && (d.usedFor === 'Mould' || d.usedFor === 'Both') && d.mouldNo) {
    const mouldCode = d.mouldNo.match(/\((\d+)\)/)?.[1] || ''
    const mouldName = d.mouldNo.split('(')[0].trim()
    const partsList = items.map((i:any) => i.partName + ' x' + i.qty).join(', ')

    if (mouldCode) {
      await supabase.from('mould_history').insert({
        mould_no: '---', job_no: mouldCode, mould_name: mouldName,
        record_date: d.date || today, pdf_source: 'LIVE', record_type: 'RM',
        machine_no: d.machine || '', issue: 'Spare parts used in mould',
        work_done: 'Parts replaced/used: ' + partsList, parts_changed: partsList,
        result: 'Done', remarks: 'Used by: ' + d.doneBy + ' | Plant: ' + d.plant
      })
    }
  }

  return NextResponse.json({ success: true, msg: items.length + ' items saved!' })
}

export async function PUT(req: Request) {
  const d = await req.json()
  if (!d.id) return NextResponse.json({ success: false, msg: 'ID required' })

  // Movement edit — update row, then recalc stock for that part
  if (d._movement) {
    // get old part name (in case part_name changed)
    const { data: oldMov } = await supabase.from('spare_movements').select('part_name').eq('id', d.id).maybeSingle()
    const { error } = await supabase.from('spare_movements').update({
      part_name: d.part_name, date: d.date, action: d.action,
      qty: parseFloat(d.qty) || 0, done_by: d.done_by || '', vendor: d.vendor || '',
    }).eq('id', d.id)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    // recalc both old and new part (if name changed)
    if (oldMov && oldMov.part_name && oldMov.part_name !== d.part_name) await recalcStock(oldMov.part_name)
    await recalcStock(d.part_name)
    return NextResponse.json({ success: true, msg: 'Movement updated & stock theek ho gaya!' })
  }

  // Spare master edit (manual stock set — keep as-is, user override)
  const status = parseFloat(d.current_stock)===0 ? 'Out of Stock'
    : parseFloat(d.current_stock) < parseFloat(d.min_qty||0) ? 'Low' : 'OK'

  const { error } = await supabase.from('spares_master').update({
    part_name: d.part_name, category: d.category, unit: d.unit,
    current_stock: parseFloat(d.current_stock) || 0, min_qty: parseFloat(d.min_qty) || 0,
    last_price: parseFloat(d.last_price) || 0, last_vendor: d.last_vendor || '',
    plant: d.plant || '', room: d.room || '', almirah: d.almirah || '',
    box_no: d.box_no || '', storage_type: d.storage_type || 'Box',
    status, last_updated: new Date().toISOString()
  }).eq('id', d.id)

  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: 'Spare updated!' })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const movementId = searchParams.get('movement_id')

  // Delete movement — then recalc stock from remaining movements
  if (movementId) {
    const { data: mov } = await supabase.from('spare_movements').select('part_name').eq('id', movementId).maybeSingle()
    const { error } = await supabase.from('spare_movements').delete().eq('id', movementId)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    if (mov && mov.part_name) await recalcStock(mov.part_name)
    return NextResponse.json({ success: true, msg: 'Movement deleted & stock theek ho gaya!' })
  }

  if (!id) return NextResponse.json({ success: false, msg: 'ID required' })
  const { error } = await supabase.from('spares_master').delete().eq('id', id)
  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: 'Deleted!' })
}
