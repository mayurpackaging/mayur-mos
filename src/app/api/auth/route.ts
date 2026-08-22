// src/app/api/auth/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function generateToken(username: string, role: string): string {
  const payload = `${username}:${role}:${Date.now()}`
  const secret = process.env.SESSION_SECRET || 'mayur-mos-secret-2026'
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${hmac}`).toString('base64')
}

export async function POST(req: Request) {
  const { username, password } = await req.json()
  if (!username || !password) {
    return NextResponse.json({ success: false, msg: 'Username aur password daalo!' })
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase())
    .eq('status', 'Active')
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, msg: 'Galat username ya password!' })
  }

  const hashedPwd = crypto.createHash('sha256').update(password).digest('hex')
  const pwdMatch = data.password === password || data.password === hashedPwd
  if (!pwdMatch) {
    return NextResponse.json({ success: false, msg: 'Galat username ya password!' })
  }

  const token = generateToken(data.username, data.role)

  const response = NextResponse.json({
    success: true,
    user: {
      name: data.full_name,
      username: data.username,
      role: data.role,
      plant: data.plant,
      modules: data.modules
    }
  })

  response.cookies.set('mos_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60,
    path: '/'
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('mos_session')
  return response
}
