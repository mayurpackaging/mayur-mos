// src/app/api/auth/route.ts
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Use service key server-side only
)

// Simple token: username:timestamp:hmac
function generateToken(username: string, role: string): string {
  const payload = `${username}:${role}:${Date.now()}`
  const secret = process.env.SESSION_SECRET || 'mayur-mos-secret-2026'
  const hmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return Buffer.from(`${payload}:${hmac}`).toString('base64')
}

export function verifyToken(token: string): { username: string; role: string } | null {
  try {
    const secret = process.env.SESSION_SECRET || 'mayur-mos-secret-2026'
    const decoded = Buffer.from(token, 'base64').toString()
    const parts = decoded.split(':')
    if (parts.length < 4) return null
    const [username, role, timestamp, hmac] = parts
    // Check expiry (24 hours)
    if (Date.now() - Number(timestamp) > 24 * 60 * 60 * 1000) return null
    // Verify HMAC
    const payload = `${username}:${role}:${timestamp}`
    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    if (hmac !== expectedHmac) return null
    return { username, role }
  } catch { return null }
}

export async function POST(req: Request) {
  const { username, password } = await req.json()
  if (!username || !password) {
    return NextResponse.json({ success: false, msg: 'Username aur password daalo!' })
  }

  // Hash password for comparison (SHA-256)
  const hashedPwd = crypto.createHash('sha256').update(password).digest('hex')

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username.toLowerCase())
    .eq('status', 'Active')
    .single()

  if (error || !data) {
    return NextResponse.json({ success: false, msg: 'Galat username ya password!' })
  }

  // Support both plain text (legacy) and hashed passwords
  const pwdMatch = data.password === password || data.password === hashedPwd
  if (!pwdMatch) {
    return NextResponse.json({ success: false, msg: 'Galat username ya password!' })
  }

  const token = generateToken(data.username, data.role)

  // Set HTTP-only cookie
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
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/'
  })

  return response
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete('mos_session')
  return response
}
