import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || ''
  const plant = searchParams.get('plant') || ''

  let q = supabase.from('production_plans')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  if (date) q = q.eq('date', date)
  if (plant) q = q.eq('plant', plant)

  const { data } = await q
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('production_plans').insert({
    date: d.date || today,
    shift: d.shift || 'Day',
    plant: d.plant || '',
    machine: d.machine || '',
    product: d.product || '',
    planned_qty: parseFloat(d.plannedQty) || 0,
    priority: d.priority || 'Medium',
    notes: d.notes || '',
    entered_by: d.enteredBy || '',
    status: 'Planned'
  })

  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: 'Production plan saved!' })
}
