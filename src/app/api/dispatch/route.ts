import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const customer = searchParams.get('customer') || ''
  const today = new Date().toISOString().split('T')[0]

  // Get parties
  const { data: parties } = await supabase.from('party_master').select('party_name, city').eq('status', 'Active').order('party_name')

  // Get today orders for customer
  let todayOrders: any[] = []
  if (customer) {
    const { data } = await supabase.from('dispatch_orders').select('*, dispatch_lines(*)').eq('date', today).ilike('customer', `%${customer}%`)
    todayOrders = data || []
  }

  // Recent dispatches
  const { data: recentOrders } = await supabase
    .from('dispatch_orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(15)

  // Get lines for these orders
  const orderIds = (recentOrders||[]).map((o:any) => o.order_id)
  const { data: allLines } = await supabase
    .from('dispatch_lines')
    .select('order_id, line_no, item_name, qty, plant')
    .in('order_id', orderIds.length > 0 ? orderIds : [''])

  // Merge lines into orders
  const recent = (recentOrders||[]).map((o:any) => ({
    ...o,
    dispatch_lines: (allLines||[]).filter((l:any) => l.order_id === o.order_id)
  }))

  return NextResponse.json({
    success: true,
    parties: parties || [],
    todayOrders: todayOrders,
    recent: recent || []
  })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  // Generate order ID and challan number
  const { count } = await supabase.from('dispatch_orders').select('*', { count: 'exact', head: true })
  const serial = String((count || 0) + 1).padStart(4, '0')
  const dateStr = today.replace(/-/g, '').slice(2)
  const orderId = `DO-${dateStr}-${serial}`
  const challanNo = `CH-${dateStr}-${serial}`

  // Calculate total
  const lines = d.lines || []
  const totalCtn = lines.reduce((a: number, l: any) => a + (parseFloat(l.qty) || 0), 0)

  // Save order
  const { data: order, error } = await supabase.from('dispatch_orders').insert({
    order_id: orderId,
    challan_no: challanNo,
    date: d.date || today,
    customer: d.customer,
    vehicle_type: d.vehicleType,
    vehicle_no: d.vehicleNo || '',
    driver_name: d.driverName || '',
    delivery_address: d.deliveryAddress || '',
    total_cartons: totalCtn,
    notes: d.notes || '',
    dispatch_by: d.dispatchBy
  }).select().single()

  if (error) return NextResponse.json({ success: false, msg: error.message })

  // Save lines
  if (lines.length > 0) {
    const lineRows = lines.map((l: any) => ({
      order_id: orderId,
      line_no: l.lineNo,
      plant: l.plant,
      item_name: l.itemName,
      qty: l.qty,
      category: l.category || ''
    }))
    await supabase.from('dispatch_lines').insert(lineRows)
  }

  // Add party if new
  if (d.customer) {
    const { data: existing } = await supabase.from('party_master').select('id').ilike('party_name', d.customer).maybeSingle()
    if (!existing) {
      await supabase.from('party_master').insert({ party_name: d.customer, status: 'Active' })
    }
  }

  return NextResponse.json({
    success: true,
    msg: `Dispatch saved! Challan: ${challanNo} | Total: ${totalCtn} Ctn`,
    orderId,
    challanNo,
    totalCtn
  })
}
