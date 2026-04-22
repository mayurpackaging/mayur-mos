import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase.from('quality_checks').select('*').eq('date', today).order('created_at', { ascending: false })
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const { entries } = await req.json()
  if (!entries || entries.length === 0) return NextResponse.json({ success: false, msg: 'Koi entry nahi!' })

  const { error } = await supabase.from('quality_checks').insert(entries)
  if (error) return NextResponse.json({ success: false, msg: error.message })

  return NextResponse.json({ success: true, msg: `${entries.length} machines quality saved!` })
}
