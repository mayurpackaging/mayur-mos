import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function istNow() { return new Date(Date.now() + 5.5 * 60 * 60 * 1000) }
function istToday() { return istNow().toISOString().split('T')[0] }
function istTime() { return istNow().toISOString().slice(11, 16) }

async function sendTelegram(token: string, chatId: string | number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
  } catch (e) {}
}

// ── Breakdown flow steps ──
// Each step: question to ask, and the data key to save the answer under
const BD_STEPS = [
  { key: 'plant', q: '1️⃣ <b>Plant kaunsa?</b>\nLikho: 477 ya 488 ya 433' },
  { key: 'machine', q: '2️⃣ <b>Machine number?</b>\nJaise: M5' },
  { key: 'mould', q: '3️⃣ <b>Mould chal raha tha?</b>\nMould ka naam likho, ya likho "nahi"' },
  { key: 'problem', q: '4️⃣ <b>Kya problem hai?</b>\nProblem detail mein likho' },
  { key: 'category', q: '5️⃣ <b>Category?</b>\nLikho: Mechanical / Electrical / Mould / Other' },
  { key: 'operator', q: '6️⃣ <b>Aapka naam?</b>' },
]

async function getSession(chatId: string) {
  const { data } = await supabase.from('telegram_sessions').select('*').eq('chat_id', chatId).maybeSingle()
  return data
}
async function setSession(chatId: string, flow: string, step: number, data: any) {
  await supabase.from('telegram_sessions').upsert({
    chat_id: chatId, flow, step, data, updated_at: new Date().toISOString(),
  })
}
async function clearSession(chatId: string) {
  await supabase.from('telegram_sessions').delete().eq('chat_id', chatId)
}

export async function POST(req: Request) {
  let update: any
  try { update = await req.json() } catch { return NextResponse.json({ ok: true }) }

  const msg = update?.message
  if (!msg || !msg.text) return NextResponse.json({ ok: true })

  const chatId = String(msg.chat?.id || '')
  const fromName = msg.from?.first_name || 'Unknown'
  const text = (msg.text || '').trim()
  const low = text.toLowerCase()

  const { data: settings } = await supabase.from('process_settings').select('telegram_bot_token').eq('id', 'default').maybeSingle()
  const token = settings?.telegram_bot_token || ''
  if (!token) return NextResponse.json({ ok: true })

  // ── Cancel anytime ──
  if (low === 'cancel' || low === '/cancel') {
    await clearSession(chatId)
    await sendTelegram(token, chatId, '❌ Cancel kar diya. Naya shuru karne ke liye "breakdown" likho.')
    return NextResponse.json({ ok: true })
  }

  // ── /start or help ──
  if (low === '/start' || low === 'help' || low === '/help') {
    await clearSession(chatId)
    await sendTelegram(token, chatId,
      `👋 Namaste ${fromName}!\n\n<b>Breakdown report karne ke liye</b> bas likho:\n<code>breakdown</code>\n\nPhir main ek-ek karke sawaal poochunga. Beech mein rokna ho toh "cancel" likho.`
    )
    return NextResponse.json({ ok: true })
  }

  // ── Check if user is in an active flow ──
  const session = await getSession(chatId)

  if (session && session.flow === 'breakdown') {
    const step = session.step || 0
    const data = session.data || {}
    const curField = BD_STEPS[step]

    // save the answer for current step
    let ans = text
    if (curField.key === 'mould' && low === 'nahi') ans = ''
    data[curField.key] = ans

    const nextStep = step + 1

    // more questions left?
    if (nextStep < BD_STEPS.length) {
      await setSession(chatId, 'breakdown', nextStep, data)
      await sendTelegram(token, chatId, BD_STEPS[nextStep].q)
      return NextResponse.json({ ok: true })
    }

    // all done — save breakdown
    const plantMap: Record<string, string> = { '477': 'Plant 477', '488': 'Plant 488', '433': 'Plant 433' }
    const plant = plantMap[(data.plant || '').replace(/[^0-9]/g, '')] || data.plant || ''
    const bdId = 'BD-' + Date.now().toString().slice(-6)

    const { error } = await supabase.from('breakdowns').insert({
      bd_id: bdId,
      date: istToday(),
      plant,
      machine: data.machine || '',
      mould_running: data.mould || '',
      problem: data.problem || '',
      category: data.category || '',
      time_of_call: istTime(),
      status: 'Pending',
      operator_name: data.operator || fromName,
      reported_by: 'Telegram - ' + (data.operator || fromName),
      reported_time: new Date().toISOString(),
    })

    await clearSession(chatId)

    if (error) {
      await sendTelegram(token, chatId, `❌ Save nahi hui: ${error.message}\n\nDobara "breakdown" likho.`)
      return NextResponse.json({ ok: true })
    }

    await sendTelegram(token, chatId,
      `✅ <b>Breakdown Entry Ho Gayi!</b> (${bdId})\n\n` +
      `🏭 Plant: ${plant}\n` +
      `🔧 Machine: ${data.machine}\n` +
      (data.mould ? `⚙️ Mould: ${data.mould}\n` : '') +
      `❗ Problem: ${data.problem}\n` +
      `📁 Category: ${data.category}\n` +
      `👷 By: ${data.operator || fromName}\n` +
      `🕐 Time: ${istTime()}\n\n` +
      `App mein entry ho gayi. Maintenance team dekh legi.`
    )
    return NextResponse.json({ ok: true })
  }

  // ── Start breakdown flow ──
  if (low === 'breakdown' || low === '/breakdown' || low === 'bd') {
    await setSession(chatId, 'breakdown', 0, {})
    await sendTelegram(token, chatId,
      `🔧 <b>Breakdown Report</b>\n\nMain ek-ek karke 6 sawaal poochunga. Beech mein rokna ho toh "cancel" likho.\n\n${BD_STEPS[0].q}`
    )
    return NextResponse.json({ ok: true })
  }

  // ── Unknown ──
  await sendTelegram(token, chatId,
    `🤔 Samajh nahi aaya.\n\n<b>Breakdown report</b> karne ke liye likho:\n<code>breakdown</code>`
  )
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, msg: 'Telegram webhook active' })
}
