import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data } = await supabase
    .from('users')
    .select('username, full_name, role, plant, status')
    .eq('status', 'Active')
    .order('full_name')
  
  return NextResponse.json({ success: true, data: data || [] })
}
