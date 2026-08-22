// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import crypto from 'crypto'

function verifyToken(token: string): boolean {
  try {
    const secret = process.env.SESSION_SECRET || 'mayur-mos-secret-2026'
    const decoded = Buffer.from(token, 'base64').toString()
    const parts = decoded.split(':')
    if (parts.length < 4) return false
    const [username, role, timestamp, hmac] = parts
    if (Date.now() - Number(timestamp) > 24 * 60 * 60 * 1000) return false
    const payload = `${username}:${role}:${timestamp}`
    const expectedHmac = crypto.createHmac('sha256', secret).update(payload).digest('hex')
    return hmac === expectedHmac
  } catch { return false }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/' || pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/')) {
    const token = request.cookies.get('mos_session')?.value
    if (!token || !verifyToken(token)) {
      return NextResponse.json(
        { success: false, msg: 'Unauthorized — Please login again' },
        { status: 401 }
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
