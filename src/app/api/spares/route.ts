import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
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
  const today = new Date().toISOString().split('T')[0]
  const items = d.items || []

  if (items.length === 0) return NextResponse.json({ success: false, msg: 'Koi item nahi!' })

  for (const item of items) {
    if (!item.partName || !item.qty) continue

    // Check if spare exists in master
    const { data: existing } = await supabase.from('spares_master').select('*').ilike('part_name', item.partName).maybeSingle()

    const qty = parseFloat(item.qty) || 0
    const price = parseFloat(item.pricePerPc) || 0

    if (existing) {
      // Update stock
      let newStock = existing.current_stock || 0
      if (d.action === 'Stock In') newStock += qty
      else if (d.action === 'Stock Out' || d.action === 'Used in Machine') newStock = Math.max(0, newStock - qty)

      const status = newStock === 0 ? 'Out of Stock' : newStock < (existing.min_qty || 0) ? 'Low' : 'OK'

      await supabase.from('spares_master').update({
        current_stock: newStock,
        last_price: price > 0 ? price : existing.last_price,
        last_vendor: d.vendor || existing.last_vendor,
        plant: item.plant || existing.plant || '',
        room: item.room || existing.room || '',
        almirah: item.almirah || existing.almirah || '',
        box_no: item.boxNo || existing.box_no || '',
        storage_type: item.storageType || existing.storage_type || 'Box',
        status,
        last_updated: new Date().toISOString()
      }).eq('id', existing.id)

      // Save movement
      await supabase.from('spare_movements').insert({
        date: d.date || today,
        slip_no: d.slipNo || '',
        vendor: d.vendor || '',
        part_name: item.partName,
        category: existing.category || item.category || '',
        action: d.action,
        qty,
        price_per_pc: price,
        total_price: qty * price,
        done_by: d.doneBy,
        new_stock: newStock,
        plant: d.plant || '',
        machine: d.machine || '',
        mould_no: d.mouldNo || '',
        mould_name: d.mouldNo ? d.mouldNo.split('(')[0].trim() : '',
        used_for: d.usedFor || ''
      })
    } else {
      // New spare - add to master
      const newStock = d.action === 'Stock In' ? qty : 0
      const status = newStock === 0 ? 'Out of Stock' : newStock < (parseFloat(item.minQty) || 0) ? 'Low' : 'OK'

      await supabase.from('spares_master').insert({
        part_name: item.partName,
        category: item.category || '',
        unit: item.unit || 'Pcs',
        min_qty: parseFloat(item.minQty) || 0,
        current_stock: newStock,
        last_price: price,
        last_vendor: d.vendor || '',
        plant: item.plant || '',
        room: item.room || '',
        almirah: item.almirah || '',
        box_no: item.boxNo || '',
        storage_type: item.storageType || 'Box',
        status
      })

      // Save movement
      await supabase.from('spare_movements').insert({
        date: d.date || today,
        slip_no: d.slipNo || '',
        vendor: d.vendor || '',
        part_name: item.partName,
        category: item.category || '',
        action: d.action,
        qty,
        price_per_pc: price,
        total_price: qty * price,
        done_by: d.doneBy,
        new_stock: newStock,
        plant: d.plant || '',
        machine: d.machine || '',
        mould_no: d.mouldNo || '',
        mould_name: d.mouldNo ? d.mouldNo.split('(')[0].trim() : '',
        used_for: d.usedFor || ''
      })
    }
  }

  // If used in mould — also save to mould_history
  if (d.action === 'Used in Machine' && (d.usedFor === 'Mould' || d.usedFor === 'Both') && d.mouldNo) {
    const mouldCode = d.mouldNo.match(/\((\d+)\)/)?.[1] || ''
    const mouldName = d.mouldNo.split('(')[0].trim()
    const partsList = items.map((i:any) => i.partName + ' x' + i.qty).join(', ')

    if (mouldCode) {
      await supabase.from('mould_history').insert({
        mould_no: '---',
        job_no: mouldCode,
        mould_name: mouldName,
        record_date: d.date || today,
        pdf_source: 'LIVE',
        record_type: 'RM',
        machine_no: d.machine || '',
        issue: 'Spare parts used in mould',
        work_done: 'Parts replaced/used: ' + partsList,
        parts_changed: partsList,
        result: 'Done',
        remarks: 'Used by: ' + d.doneBy + ' | Plant: ' + d.plant
      })
    }
  }

  return NextResponse.json({ success: true, msg: items.length + ' items saved!' })
}

export async function PUT(req: Request) {
  const d = await req.json()
  if (!d.id) return NextResponse.json({ success: false, msg: 'ID required' })

  // Movement edit
  if (d._movement) {
    const { error } = await supabase.from('spare_movements').update({
      part_name: d.part_name,
      date: d.date,
      action: d.action,
      qty: parseFloat(d.qty) || 0,
      done_by: d.done_by || '',
      vendor: d.vendor || '',
    }).eq('id', d.id)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Movement updated!' })
  }

  // Spare master edit
  const status = parseFloat(d.current_stock)===0 ? 'Out of Stock'
    : parseFloat(d.current_stock) < parseFloat(d.min_qty||0) ? 'Low' : 'OK'

  const { error } = await supabase.from('spares_master').update({
    part_name: d.part_name,
    category: d.category,
    unit: d.unit,
    current_stock: parseFloat(d.current_stock) || 0,
    min_qty: parseFloat(d.min_qty) || 0,
    last_price: parseFloat(d.last_price) || 0,
    last_vendor: d.last_vendor || '',
    plant: d.plant || '',
    room: d.room || '',
    almirah: d.almirah || '',
    box_no: d.box_no || '',
    storage_type: d.storage_type || 'Box',
    status,
    last_updated: new Date().toISOString()
  }).eq('id', d.id)

  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: 'Spare updated!' })
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const movementId = searchParams.get('movement_id')

  // Delete movement
  if (movementId) {
    const { error } = await supabase.from('spare_movements').delete().eq('id', movementId)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Movement deleted!' })
  }

  // Delete spare master
  if (!id) return NextResponse.json({ success: false, msg: 'ID required' })
  const { error } = await supabase.from('spares_master').delete().eq('id', id)
  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: 'Deleted!' })
}
