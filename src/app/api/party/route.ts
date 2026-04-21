import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('party_master')
    .select('party_name, city')
    .eq('status', 'Active')
    .order('party_name')

  if (error) return NextResponse.json({ success: false, parties: [] })
  return NextResponse.json({ success: true, parties: data?.map(p => ({ name: p.party_name, city: p.city })) || [] })
}

export async function POST(req: Request) {
  const { partyName, city, phone } = await req.json()
  const { error } = await supabase.from('party_master').insert({ party_name: partyName, city, phone, status: 'Active' })
  if (error) return NextResponse.json({ success: false, msg: error.message })
  return NextResponse.json({ success: true, msg: 'Party added!' })
}
