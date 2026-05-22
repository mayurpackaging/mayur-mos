import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET() {
  const { data, error } = await supabase
    .from('product_weights')
    .select('*')
    .order('item_name')

  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, data: data || [] })
}
