import { NextResponse } from 'next/server'

// Vercel Cron (ya koi external scheduler) isko GET karega fixed time pe.
// Yeh internally /api/telegram send_reminders ko trigger karta hai.
export async function GET(req: Request) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin

  // optional simple security: ?key=SECRET (set CRON_SECRET env var)
  const { searchParams } = new URL(req.url)
  const key = searchParams.get('key') || ''
  const secret = process.env.CRON_SECRET || ''
  if (secret && key !== secret) {
    return NextResponse.json({ success: false, msg: 'Unauthorized' }, { status: 401 })
  }

  const res = await fetch(`${base}/api/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'send_reminders' }),
  }).then(r => r.json()).catch(() => ({ success: false, msg: 'trigger failed' }))

  return NextResponse.json(res)
}
