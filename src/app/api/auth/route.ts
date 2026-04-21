import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: Request) {
  const { username, password } = await req.json()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase())
    .eq('password', password)
    .eq('status', 'Active')
    .single()
  
  if (error || !data) {
    return NextResponse.json({ success: false, msg: 'Galat username ya password!' })
  }
  
  return NextResponse.json({
    success: true,
    user: {
      name: data.full_name,
      username: data.username,
      role: data.role,
      plant: data.plant,
      modules: data.modules
    }
  })
}
