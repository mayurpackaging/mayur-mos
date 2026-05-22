import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('rejections')
    .select('*')
    .eq('date', date)
    .order('created_at', { ascending: false })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  try {
    const d = await req.json()
    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase.from('rejections').insert({
      date: d.date || today,
      shift: d.shift || '',
      plant: d.plant || '',
      machine: d.machine || '',
      product: d.product || '',
      rejection_qty: parseFloat(d.rejectionQty) || 0,
      rejection_weight: parseFloat(d.rejectionWeight) || 0,
      reason: d.reason || '',
      action_taken: d.action || '',
      notes: d.notes || '',
      entered_by: d.enteredBy || ''
    })

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Rejection entry saved!' })
  } catch (err: any) {
    return NextResponse.json({ success: false, msg: err.message || 'Server error' })
  }
}
