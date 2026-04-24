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
        new_stock: newStock
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
        new_stock: newStock
      })
    }
  }

  return NextResponse.json({ success: true, msg: `${items.length} items saved!` })
}
