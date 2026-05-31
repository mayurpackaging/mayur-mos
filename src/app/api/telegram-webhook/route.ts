import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function istNow() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000)
}
function istToday() {
  return istNow().toISOString().split('T')[0]
}
function istTime() {
  return istNow().toISOString().slice(11, 16) // HH:MM
}

async function sendTelegram(token: string, chatId: string | number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch (e) {}
}

export async function POST(req: Request) {
  let update: any
  try { update = await req.json() } catch { return NextResponse.json({ ok: true }) }

  const msg = update?.message
  if (!msg || !msg.text) return NextResponse.json({ ok: true })

  const chatId = msg.chat?.id
  const fromName = msg.from?.first_name || 'Unknown'
  const text = (msg.text || '').trim()

  // bot token
  const { data: settings } = await supabase.from('process_settings').select('telegram_bot_token').eq('id', 'default').maybeSingle()
  const token = settings?.telegram_bot_token || ''
  if (!token) return NextResponse.json({ ok: true })

  // ── /start or help ──
  if (text === '/start' || text.toLowerCase() === 'help' || text === '/help') {
    await sendTelegram(token, chatId,
      `👋 Namaste ${fromName}!\n\n<b>Breakdown report karne ke liye</b> aise likho:\n\n<code>machine, mould | problem | plant</code>\n\n<b>Example:</b>\n<code>M5, Common Lid 2nd | motor heating | Plant 477</code>\n\nPlant likhna optional hai. Bas yeh format yaad rakho — 3 hisse | se alag.`
    )
    return NextResponse.json({ ok: true })
  }

  // ── Breakdown entry: must contain at least one "|" ──
  if (text.includes('|')) {
    const parts = text.split('|').map((p: string) => p.trim())
    // parts[0] = "machine, mould" ; parts[1] = problem ; parts[2] = plant (optional)
    const machineMould = (parts[0] || '').split(',').map((p: string) => p.trim())
    const machine = machineMould[0] || ''
    const mould = machineMould[1] || ''
    const problem = parts[1] || ''
    const plant = parts[2] || ''

    if (!machine || !problem) {
      await sendTelegram(token, chatId,
        `⚠️ Format galat hai.\n\nSahi format:\n<code>machine, mould | problem | plant</code>\n\nExample:\n<code>M5, Common Lid 2nd | motor heating | Plant 477</code>`
      )
      return NextResponse.json({ ok: true })
    }

    // generate bd_id
    const bdId = 'BD-' + Date.now().toString().slice(-6)

    const { error } = await supabase.from('breakdowns').insert({
      bd_id: bdId,
      date: istToday(),
      plant,
      machine,
      mould_running: mould,
      problem,
      time_of_call: istTime(),
      status: 'Open',
      reported_by: 'Telegram - ' + fromName,
      reported_time: new Date().toISOString(),
    })

    if (error) {
      await sendTelegram(token, chatId, `❌ Entry save nahi hui: ${error.message}`)
      return NextResponse.json({ ok: true })
    }

    await sendTelegram(token, chatId,
      `✅ <b>Breakdown noted!</b> (${bdId})\n\n🔧 Machine: ${machine}\n${mould ? '⚙️ Mould: ' + mould + '\n' : ''}❗ Problem: ${problem}\n${plant ? '🏭 Plant: ' + plant + '\n' : ''}🕐 Time: ${istTime()}\n\nApp mein entry ho gayi. Maintenance team dekh legi.`
    )
    return NextResponse.json({ ok: true })
  }

  // ── Unknown message ──
  await sendTelegram(token, chatId,
    `🤔 Samajh nahi aaya.\n\nBreakdown report karne ke liye aise likho:\n<code>machine, mould | problem | plant</code>\n\nMadad ke liye 'help' likho.`
  )
  return NextResponse.json({ ok: true })
}

// Telegram sometimes sends GET to verify — respond OK
export async function GET() {
  return NextResponse.json({ ok: true, msg: 'Telegram webhook active' })
}
