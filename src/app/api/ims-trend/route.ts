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
  {name:"1500 ml Container Milky",category:"Tub",pkg:100,minC:20},
  {name:"2000 ml Tamper Lock Milky",category:"Tamper",pkg:75,minC:20},
  {name:"2000 ml Tamper Lock Black",category:"Tamper",pkg:75,minC:20},
  {name:"500 ml Rectangle Container (Black)",category:"Rectangle",pkg:250,minC:20},
  {name:"650 ml Rectangle Container (Black)",category:"Rectangle",pkg:200,minC:20},
  {name:"750 ml Rectangle Container (Black)",category:"Rectangle",pkg:175,minC:20},
  {name:"1000 ml Rectangle Container (Black)",category:"Rectangle",pkg:150,minC:20},
  {name:"500 ml Oval Tamper Evident",category:"Oval",pkg:250,minC:20},
  {name:"750 ml Oval Tamper Evident",category:"Oval",pkg:200,minC:20},
  {name:"1000 ml Oval Tamper Evident",category:"Oval",pkg:150,minC:20},
  {name:"50 ml Lid",category:"Lid",pkg:1200,minC:20},
  {name:"100 ml Lid",category:"Lid",pkg:800,minC:20},
  {name:"175 ml Lid",category:"Lid",pkg:600,minC:20},
  {name:"250 ml Lid",category:"Lid",pkg:400,minC:20},
  {name:"Common Lid",category:"Lid",pkg:500,minC:30},
  {name:"Big Common Lid",category:"Lid",pkg:400,minC:20},
  {name:"Sipper New Lid",category:"Lid",pkg:400,minC:20},
  {name:"Rectangle Lid",category:"Lid",pkg:300,minC:15},
  {name:"Oval Lid",category:"Lid",pkg:300,minC:15},
]

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '15')
  
  // Get last N days
  const dates: string[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(d.toISOString().split('T')[0])
  }

  // Get all stock data for date range
  const { data: stockData } = await supabase
    .from('ims_stock')
    .select('item_name, stock_cartons, date')
    .gte('date', dates[0])
    .lte('date', dates[dates.length - 1])
    .order('date', { ascending: true })

  // Build date-wise map
  const stockMap: Record<string, Record<string, number>> = {}
  stockData?.forEach(r => {
    if (!stockMap[r.date]) stockMap[r.date] = {}
    stockMap[r.date][r.item_name] = r.stock_cartons
  })

  // Build trend data per item
  const trendData = IMS_ITEMS.map(item => {
    const trend = dates.map(date => ({
      date,
      stock: stockMap[date]?.[item.name] ?? null
    }))
    return {
      name: item.name,
      category: item.category,
      minC: item.minC,
      trend
    }
  })

  return NextResponse.json({ success: true, dates, trendData })
}
