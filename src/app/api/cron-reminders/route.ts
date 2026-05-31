import { NextResponse } from 'next/server'

// Cron scheduler (cron-job.org) isko GET karega fixed time pe.
// Yeh internally /api/telegram send_reminders ko trigger karta hai.
export async function GET(req: Request) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin

  const res = await fetch(`${base}/api/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'send_reminders' }),
  }).then(r => r.json()).catch(() => ({ success: false, msg: 'trigger failed' }))

  return NextResponse.json(res)
}
