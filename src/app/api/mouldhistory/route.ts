import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const job_no = searchParams.get('job_no')

  if (!job_no) {
    return NextResponse.json({ error: 'job_no required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('mould_history')
    .select('*')
    .eq('job_no', job_no)
    .order('record_date', { ascending: true })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data || [])
}
