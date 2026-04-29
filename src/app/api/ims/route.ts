import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const IMS_ITEMS = [
  {name:"50 ml Container Black",category:"Tub",pkg:1200,minC:50},
  {name:"50 ml Container Natural",category:"Tub",pkg:1200,minC:50},
  {name:"100 ml Container Milky",category:"Tub",pkg:800,minC:50},
  {name:"100 ml Container Natural",category:"Tub",pkg:800,minC:30},
  {name:"100 ml Container Black",category:"Tub",pkg:800,minC:30},
  {name:"175 ml Container Milky",category:"Tub",pkg:600,minC:30},
  {name:"175 ml Container Black",category:"Tub",pkg:600,minC:30},
  {name:"250 ml Container Milky",category:"Tub",pkg:400,minC:50},
  {name:"250 ml Container Black",category:"Tub",pkg:400,minC:50},
  {name:"250 ml Container Milky (500/ctn)",category:"Tub",pkg:500,minC:30},
  {name:"300 ml Container Black",category:"Tub",pkg:350,minC:30},
  {name:"300 ml Container Milky",category:"Tub",pkg:350,minC:30},
  {name:"400 ml Container Milky",category:"Tub",pkg:300,minC:30},
  {name:"400 ml Container Black",category:"Tub",pkg:300,minC:30},
  {name:"500 ml Container Black",category:"Tub",pkg:250,minC:50},
  {name:"500 ml Container Milky",category:"Tub",pkg:250,minC:50},
  {name:"750 ml Container Milky",category:"Tub",pkg:200,minC:30},
  {name:"750 ml Container Black",category:"Tub",pkg:200,minC:30},
  {name:"1000 ml Container Milky",category:"Tub",pkg:150,minC:30},
  {name:"1000 ml Container Black",category:"Tub",pkg:150,minC:30},
  {name:"1200 ml Container Milky",category:"Tub",pkg:120,minC:20},
  {name:"1200 ml Container Black",category:"Tub",pkg:120,minC:20},
  {name:"1500 ml Container Milky",category:"Tub",pkg:100,minC:20},
  {name:"1500 ml Container Black",category:"Tub",pkg:100,minC:20},
  {name:"500 ml Rectangle Container (Black)",category:"Rectangle",pkg:250,minC:20},
  {name:"650 ml Rectangle Container (Black)",category:"Rectangle",pkg:200,minC:20},
  {name:"750 ml Rectangle Container (Black)",category:"Rectangle",pkg:175,minC:20},
  {name:"1000 ml Rectangle Container (Black)",category:"Rectangle",pkg:150,minC:20},
  {name:"Cafe Glass With Sipper Lid 350 ml",category:"Glass",pkg:200,minC:20},
  {name:"Cafe Glass With Sipper Lid 500 ml",category:"Glass",pkg:150,minC:20},
  {name:"Cafe Sipper XL With Lid 300 ml",category:"Glass",pkg:200,minC:20},
  {name:"Cafe Sipper XL With Lid 350 ml",category:"Glass",pkg:200,minC:20},
  {name:"Cafe Sipper XL With Lid 500 ml",category:"Glass",pkg:150,minC:20},
  {name:"2000 ml Tamper Lock Milky",category:"Tamper",pkg:75,minC:20},
  {name:"2000 ml Tamper Lock Black",category:"Tamper",pkg:75,minC:20},
  {name:"2000 ml Tamper Lock Natural",category:"Tamper",pkg:75,minC:20},
  {name:"2500 ml Tamper Lock Milky",category:"Tamper",pkg:60,minC:15},
  {name:"2500 ml Tamper Lock Black",category:"Tamper",pkg:60,minC:15},
  {name:"2500 ml Tamper Lock Natural",category:"Tamper",pkg:60,minC:15},
  {name:"500 ml Oval Tamper Evident",category:"Oval",pkg:250,minC:20},
  {name:"750 ml Oval Tamper Evident",category:"Oval",pkg:200,minC:20},
  {name:"1000 ml Oval Tamper Evident",category:"Oval",pkg:150,minC:20},
  {name:"RO Series - RO 16 Natural",category:"RO",pkg:300,minC:20},
  {name:"RO Series - RO 16 Black",category:"RO",pkg:300,minC:20},
  {name:"RO Series - RO 24 Natural",category:"RO",pkg:250,minC:20},
  {name:"RO Series - RO 24 Black",category:"RO",pkg:250,minC:20},
  {name:"RO Series - RO 32 Natural",category:"RO",pkg:200,minC:20},
  {name:"RO Series - RO 32 Black",category:"RO",pkg:200,minC:20},
  {name:"Re Series - Re 16 Natural",category:"RE",pkg:300,minC:20},
  {name:"Re Series - Re 16 Black",category:"RE",pkg:300,minC:20},
  {name:"Re Series - Re 24 Natural",category:"RE",pkg:250,minC:20},
  {name:"Re Series - Re 24 Black",category:"RE",pkg:250,minC:20},
  {name:"Re Series - Re 28 Natural",category:"RE",pkg:200,minC:20},
  {name:"Re Series - Re 28 Black",category:"RE",pkg:200,minC:20},
  {name:"Re Series - Re 38 Natural",category:"RE",pkg:175,minC:15},
  {name:"Re Series - Re 38 Black",category:"RE",pkg:175,minC:15},
  {name:"500 Tamper Black Rectangle",category:"Rectangle",pkg:250,minC:20},
  {name:"650 Tamper Black Rectangle",category:"Rectangle",pkg:200,minC:20},
  {name:"750 Tamper Black Rectangle",category:"Rectangle",pkg:175,minC:20},
  {name:"1000 Tamper Black Rectangle",category:"Rectangle",pkg:150,minC:20},
  {name:"Handle",category:"Accessory",pkg:1000,minC:10},
]

// Min stock overrides table
const IMS_MIN_TABLE = 'ims_min_stock'

export async function GET() {
  // Get min stock overrides
  const { data: minOverrides } = await supabase
    .from('ims_min_stock')
    .select('item_name, min_cartons')
    .catch(() => ({data: null})) as any

  const minMap: Record<string, number> = {}
  if (minOverrides) {
    minOverrides.forEach((r: any) => { minMap[r.item_name] = r.min_cartons })
  }

  const { data: stockData } = await supabase
    .from('ims_stock')
    .select('item_name, stock_cartons, unpack_cartons, unpack_lid, status, date')
    .order('created_at', { ascending: false })

  const stockMap: Record<string, any> = {}
  if (stockData) {
    for (const row of stockData) {
      if (!stockMap[row.item_name]) stockMap[row.item_name] = row
    }
  }

  const items = IMS_ITEMS.map(item => {
    const stock = stockMap[item.name]
    const stockC = stock ? Number(stock.stock_cartons) : 0
    const unpackC = stock ? Number(stock.unpack_cartons) : 0
    const unpackL = stock ? Number(stock.unpack_lid) : 0
    // Use override min if available
    const minC = minMap[item.name] !== undefined ? minMap[item.name] : item.minC
    const effective = stockC + Math.min(unpackC, unpackL)
    const pct = minC > 0 ? Math.round(effective / minC * 100) : 0
    const status = !stock ? 'Not Updated' : effective === 0 ? 'CRITICAL' : pct < 25 ? 'CRITICAL' : pct < 50 ? 'DANGER' : pct < 75 ? 'LOW' : pct < 100 ? 'OK' : 'SAFE'

    return { ...item, minC, stockC, unpackC, unpackL: unpackL, pct, status, lastDate: stock?.date || '' }
  })

  return NextResponse.json({ success: true, items })
}

export async function POST(req: Request) {
  const { plant, enteredBy, entries } = await req.json()
  const today = new Date().toISOString().split('T')[0]
  const rows = entries.map((e: any) => ({
    date: today, plant, item_name: e.itemName,
    category: e.category || '',
    stock_cartons: e.stockCartons || 0,
    unpack_cartons: e.unpackCartons || 0,
    unpack_lid: e.unpackLid || 0,
    entered_by: enteredBy, status: 'OK'
  }))
  const { error } = await supabase.from('ims_stock').insert(rows)
  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: `${rows.length} items saved!` })
}

export async function PUT(req: Request) {
  // Update min stock overrides
  const { updates } = await req.json()
  if (!updates || updates.length === 0) return NextResponse.json({ success: false, msg: 'No updates!' })

  // Upsert into ims_min_stock table
  const rows = updates.map((u: any) => ({
    item_name: u.name,
    min_cartons: u.minC,
    updated_at: new Date().toISOString()
  }))

  const { error } = await supabase
    .from('ims_min_stock')
    .upsert(rows, { onConflict: 'item_name' })

  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: `${updates.length} items ka min stock update ho gaya!` })
}
