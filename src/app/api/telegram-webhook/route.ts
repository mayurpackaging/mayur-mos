import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MOULDS = [
  {code:"6640",name:"50 ml Tub"},{code:"6774",name:"100 ml Tub"},{code:"6619",name:"175 ml Tub"},
  {code:"6369",name:"250 ml Tub"},{code:"6371",name:"300 ml Tub"},{code:"6537",name:"400 ml Tub"},
  {code:"6372",name:"500 ml Tub 4 Cav"},{code:"6889",name:"500 ml Tub 6 Cav"},
  {code:"6374",name:"750 ml Tub"},{code:"6987",name:"New 750 ml Tub"},
  {code:"6375",name:"1000 ml Tub"},{code:"6988",name:"1000 ml Tub New"},
  {code:"6500",name:"1200 ml Tub"},{code:"6501",name:"1500 ml Tub"},
  {code:"6899",name:"2000 ml Tub"},{code:"6688",name:"2500 ml Tub"},
  {code:"6479",name:"500 ml Rectangle"},{code:"6480",name:"650 ml Rectangle"},
  {code:"6481",name:"750 ml Rectangle"},{code:"6482",name:"1000 ml Rectangle"},
  {code:"6872",name:"1000 ml Rectangle New"},
  {code:"6714",name:"500 ml Oval"},{code:"6715",name:"750 ml Oval"},{code:"6716",name:"1000 ml Oval"},
  {code:"6709",name:"350 ml Glass Old"},{code:"6903",name:"300 ml Glass"},
  {code:"6904",name:"350 ml Glass"},{code:"6905",name:"500 ml Glass"},{code:"6502",name:"650 ml Bowl"},
  {code:"6753",name:"RO 16 Tub"},{code:"6754",name:"RO 24 Tub"},{code:"6755",name:"RO 32 Tub"},
  {code:"6758",name:"RE 16 Tub"},{code:"6759",name:"RE 24 Tub"},
  {code:"6760",name:"RE 28 Tub"},{code:"6761",name:"RE 38 Tub"},
  {code:"6641",name:"50 ml Lid"},{code:"6775",name:"100 ml Lid"},
  {code:"6370",name:"250 ml Lid"},{code:"6373",name:"Common Lid 1st"},
  {code:"6605",name:"Common Lid 2nd"},{code:"6840",name:"Common Lid 8 Cav"},
  {code:"6690",name:"2000 ml Common Lid"},{code:"6483",name:"Rectangle Lid"},
  {code:"6873",name:"Tamper Lock Rectangle Lid"},{code:"6717",name:"Oval Lid"},
  {code:"6756",name:"RO 16 Lid"},{code:"6757",name:"RO 24/32 Lid"},
  {code:"6762",name:"RE 16/24 Lid"},{code:"6763",name:"RE 28/38 Lid"},
  {code:"6710",name:"Sipper Lid Old"},{code:"6906",name:"Sipper Lid New"},
  {code:"6620",name:"175 ml Lid"},{code:"6503",name:"Big Common Lid"},
]

function istNow() { return new Date(Date.now() + 5.5 * 60 * 60 * 1000) }
function istToday() { return istNow().toISOString().split('T')[0] }
function istTime() { return istNow().toISOString().slice(11, 16) }

async function tgSend(token: string, chatId: string | number, text: string, buttons?: any) {
  try {
    const body: any = { chat_id: chatId, text, parse_mode: 'HTML' }
    if (buttons) body.reply_markup = buttons
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
  } catch (e) {}
}
async function tgAnswerCallback(token: string, cbId: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/answerCallbackQuery`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ callback_query_id: cbId }),
    })
  } catch (e) {}
}

const BD_STEPS = [
  { key: 'plant', q: '1️⃣ <b>Plant kaunsa?</b>\nLikho: 477 ya 488 ya 433' },
  { key: 'machine', q: '2️⃣ <b>Machine number?</b>\nJaise: M5' },
  { key: 'mould', q: '3️⃣ <b>Mould kaunsa chal raha tha?</b>\nMould ka naam ya size type karo (jaise "common" ya "250"), main list dunga. Ya "nahi" likho.' },
  { key: 'problem', q: '4️⃣ <b>Kya problem hai?</b>\nDetail mein likho' },
  { key: 'category', q: '5️⃣ <b>Category?</b>', buttons: ['Mechanical', 'Electrical', 'Mould', 'Other'] },
  { key: 'operator', q: '6️⃣ <b>Aapka naam?</b>' },
]

async function getSession(chatId: string) {
  const { data } = await supabase.from('telegram_sessions').select('*').eq('chat_id', chatId).maybeSingle()
  return data
}
async function setSession(chatId: string, flow: string, step: number, data: any) {
  await supabase.from('telegram_sessions').upsert({ chat_id: chatId, flow, step, data, updated_at: new Date().toISOString() })
}
async function clearSession(chatId: string) {
  await supabase.from('telegram_sessions').delete().eq('chat_id', chatId)
}

// build inline buttons from a list of {text, data}
function inlineButtons(items: { text: string, data: string }[]) {
  return { inline_keyboard: items.map(it => [{ text: it.text, callback_data: it.data }]) }
}

// ask a step's question (with buttons if any)
async function askStep(token: string, chatId: string, step: number) {
  const s = BD_STEPS[step]
  if (s.buttons) {
    const btns = inlineButtons(s.buttons.map(b => ({ text: b, data: 'cat:' + b })))
    await tgSend(token, chatId, s.q, btns)
  } else {
    await tgSend(token, chatId, s.q)
  }
}

// save final breakdown to both breakdowns + mould_history
async function saveBreakdown(token: string, chatId: string, data: any, fromName: string) {
  const plantMap: Record<string, string> = { '477': 'Plant 477', '488': 'Plant 488', '433': 'Plant 433' }
  const plant = plantMap[(data.plant || '').replace(/[^0-9]/g, '')] || data.plant || ''
  const bdId = 'BD-' + Date.now().toString().slice(-6)
  const mouldName = data.mould_name || ''
  const mouldCode = data.mould_code || ''

  const { error } = await supabase.from('breakdowns').insert({
    bd_id: bdId, date: istToday(), plant,
    machine: data.machine || '',
    mould_running: mouldName ? (mouldName + (mouldCode ? ' (' + mouldCode + ')' : '')) : '',
    problem: data.problem || '', category: data.category || '',
    time_of_call: istTime(), status: 'Pending',
    operator_name: data.operator || fromName,
    reported_by: 'Telegram - ' + (data.operator || fromName),
    reported_time: new Date().toISOString(),
  })

  // also add to mould_history (so it shows in Mould History timeline) — only if we have a code
  if (mouldCode) {
    await supabase.from('mould_history').insert({
      job_no: mouldCode, record_date: istToday(), record_type: 'BD',
      machine_no: data.machine || '', issue: data.problem || '',
      work_done: '', result: 'Pending',
    })
  }

  await clearSession(chatId)

  if (error) {
    await tgSend(token, chatId, `❌ Save nahi hui: ${error.message}\n\nDobara "breakdown" likho.`)
    return
  }
  await tgSend(token, chatId,
    `✅ <b>Breakdown Entry Ho Gayi!</b> (${bdId})\n\n` +
    `🏭 Plant: ${plant}\n🔧 Machine: ${data.machine}\n` +
    (mouldName ? `⚙️ Mould: ${mouldName}${mouldCode ? ' (' + mouldCode + ')' : ''}\n` : '') +
    `❗ Problem: ${data.problem}\n📁 Category: ${data.category}\n` +
    `👷 By: ${data.operator || fromName}\n🕐 Time: ${istTime()}\n\n` +
    `App mein entry ho gayi. Maintenance team dekh legi.`
  )
}

export async function POST(req: Request) {
  let update: any
  try { update = await req.json() } catch { return NextResponse.json({ ok: true }) }

  const { data: settings } = await supabase.from('process_settings').select('telegram_bot_token').eq('id', 'default').maybeSingle()
  const token = settings?.telegram_bot_token || ''
  if (!token) return NextResponse.json({ ok: true })

  // ── Handle button taps (callback_query) ──
  if (update.callback_query) {
    const cb = update.callback_query
    const chatId = String(cb.message?.chat?.id || '')
    const fromName = cb.from?.first_name || 'Unknown'
    const cbData = cb.data || ''
    await tgAnswerCallback(token, cb.id)

    const session = await getSession(chatId)
    if (!session || session.flow !== 'breakdown') return NextResponse.json({ ok: true })
    const data = session.data || {}

    // mould chosen
    if (cbData.startsWith('mould:')) {
      const code = cbData.slice(6)
      const m = MOULDS.find(x => x.code === code)
      data.mould_name = m ? m.name : ''
      data.mould_code = code
      const next = 3 // problem step (mould was step 2)
      await setSession(chatId, 'breakdown', next, data)
      await tgSend(token, chatId, `✅ Mould: ${m ? m.name : code} (${code})`)
      await askStep(token, chatId, next)
      return NextResponse.json({ ok: true })
    }
    // category chosen
    if (cbData.startsWith('cat:')) {
      data.category = cbData.slice(4)
      const next = 5 // operator step
      await setSession(chatId, 'breakdown', next, data)
      await tgSend(token, chatId, `✅ Category: ${data.category}`)
      await askStep(token, chatId, next)
      return NextResponse.json({ ok: true })
    }
    return NextResponse.json({ ok: true })
  }

  // ── Normal text message ──
  const msg = update?.message
  if (!msg || !msg.text) return NextResponse.json({ ok: true })

  const chatId = String(msg.chat?.id || '')
  const fromName = msg.from?.first_name || 'Unknown'
  const text = (msg.text || '').trim()
  const low = text.toLowerCase()

  if (low === 'cancel' || low === '/cancel') {
    await clearSession(chatId)
    await tgSend(token, chatId, '❌ Cancel kar diya. Naya shuru: "breakdown" likho.')
    return NextResponse.json({ ok: true })
  }
  if (low === '/start' || low === 'help' || low === '/help') {
    await clearSession(chatId)
    await tgSend(token, chatId, `👋 Namaste ${fromName}!\n\n<b>Breakdown report</b> karne ke liye likho:\n<code>breakdown</code>\n\nBeech mein rokna ho toh "cancel" likho.`)
    return NextResponse.json({ ok: true })
  }

  const session = await getSession(chatId)

  if (session && session.flow === 'breakdown') {
    const step = session.step || 0
    const data = session.data || {}
    const curField = BD_STEPS[step]

    // MOULD step (step index 2) — search and show buttons
    if (curField.key === 'mould') {
      if (low === 'nahi' || low === 'no') {
        data.mould_name = ''; data.mould_code = ''
        const next = 3
        await setSession(chatId, 'breakdown', next, data)
        await askStep(token, chatId, next)
        return NextResponse.json({ ok: true })
      }
      // search moulds
      const matches = MOULDS.filter(m =>
        m.name.toLowerCase().includes(low) || m.code.includes(text)
      ).slice(0, 8)
      if (matches.length === 0) {
        await tgSend(token, chatId, `🔍 "${text}" se koi mould nahi mila. Dobara naam/size type karo (jaise "common", "250", "lid"). Ya "nahi" likho.`)
        return NextResponse.json({ ok: true })
      }
      const btns = inlineButtons(matches.map(m => ({ text: `${m.name} (${m.code})`, data: 'mould:' + m.code })))
      await tgSend(token, chatId, `👇 In mein se mould chuno:`, btns)
      return NextResponse.json({ ok: true })
    }

    // category step — if typed instead of button, accept text too
    // other steps — save text answer
    data[curField.key] = text
    const nextStep = step + 1

    if (nextStep < BD_STEPS.length) {
      await setSession(chatId, 'breakdown', nextStep, data)
      await askStep(token, chatId, nextStep)
      return NextResponse.json({ ok: true })
    }
    await saveBreakdown(token, chatId, data, fromName)
    return NextResponse.json({ ok: true })
  }

  if (low === 'breakdown' || low === '/breakdown' || low === 'bd') {
    await setSession(chatId, 'breakdown', 0, {})
    await tgSend(token, chatId, `🔧 <b>Breakdown Report</b>\n\nMain ek-ek karke sawaal poochunga. Rokna ho toh "cancel".\n\n${BD_STEPS[0].q}`)
    return NextResponse.json({ ok: true })
  }

  await tgSend(token, chatId, `🤔 Samajh nahi aaya.\n\n<b>Breakdown report</b> ke liye likho:\n<code>breakdown</code>`)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, msg: 'Telegram webhook active' })
}
