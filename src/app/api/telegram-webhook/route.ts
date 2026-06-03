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

const SLOTS_DAY = ['8am-11am','11am-2pm','2pm-5pm','5pm-8pm']
const SLOTS_NIGHT = ['8pm-11pm','11pm-2am','2am-5am','5am-8am']

const PROD_STEPS = [
  { key: 'machine', q: '1️⃣ <b>Machine number?</b>\nJaise: M1 ya M2' },
  { key: 'mould', q: '2️⃣ <b>Mould kaunsa?</b>\nNaam ya size type karo (jaise "250" ya "lid"), main list dunga.' },
  { key: 'cavities', q: '3️⃣ <b>Cavities kitni?</b>\nNumber likho (jaise 4)' },
  { key: 'shift', q: '4️⃣ <b>Shift?</b>', buttons: ['Day (8am-8pm)', 'Night (8pm-8am)'] },
  { key: 'slot', q: '5️⃣ <b>Kaunsa slot?</b>' },
  { key: 'good', q: '6️⃣ <b>Good parts kitne?</b>\nNumber likho' },
  { key: 'rejection', q: '7️⃣ <b>Rejection kitna?</b>\nNumber likho (nahi hai toh 0)' },
  { key: 'operator', q: '8️⃣ <b>Aapka naam?</b>' },
]

const REJ_STEPS = [
  { key: 'machine', q: '1️⃣ <b>Machine number?</b>\nJaise: M1' },
  { key: 'product', q: '2️⃣ <b>Product/item kya?</b>\nNaam likho' },
  { key: 'rejection_qty', q: '3️⃣ <b>Rejection kitna (pcs)?</b>\nNumber likho' },
  { key: 'reason', q: '4️⃣ <b>Reason kya?</b>\nLikho (jaise "short shot", "black spot")' },
  { key: 'operator', q: '5️⃣ <b>Aapka naam?</b>' },
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

// ask a step's question (with buttons if any) — flow-aware
async function askStep(token: string, chatId: string, step: number, flow: string = 'breakdown') {
  const steps = flow === 'production' ? PROD_STEPS : flow === 'rejection' ? REJ_STEPS : BD_STEPS
  const s = steps[step]
  if (!s) return
  if ((s as any).buttons) {
    const btns = inlineButtons((s as any).buttons.map((b: string) => ({ text: b, data: 'opt:' + b })))
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

const plantFromData = (p: string) => {
  const map: Record<string, string> = { '477': 'Plant 477', '488': 'Plant 488', '433': 'Plant 433' }
  return map[(p || '').replace(/[^0-9]/g, '')] || p || 'Plant 433'
}

// save production (slot-wise) via machine-setup style merge
async function saveProduction(token: string, chatId: string, data: any, fromName: string) {
  const plant = 'Plant 433'
  const date = istToday()
  const shift = data.shift || 'Day (8am-8pm)'
  const machine = data.machine || ''
  const mould = data.mould_code ? (data.mould_code + ' - ' + (data.mould_name || '')) : (data.mould || '')
  const slotName = data.slot || ''
  const good = parseFloat(data.good) || 0
  const rej = parseFloat(data.rejection) || 0
  const cavities = parseFloat(data.cavities) || 0

  // find existing production row (same date+machine+shift+plant+mould)
  const { data: existRows } = await supabase.from('production')
    .select('id').eq('date', date).eq('machine', machine).eq('shift', shift)
    .eq('plant', plant).eq('mould', mould).order('created_at', { ascending: true }).limit(1)
  const existing = (existRows && existRows.length > 0) ? existRows[0] : null

  let prodId: string
  if (existing) {
    prodId = existing.id
  } else {
    const { data: prod, error } = await supabase.from('production').insert({
      date, shift, plant, machine, mould, cavities,
      operator: data.operator || fromName, product: data.mould_name || '',
      good_parts: 0, rejection: 0, downtime: 0, shots_this_shift: 0,
      machine_status: 'running', entered_by: 'Telegram - ' + (data.operator || fromName),
    }).select().single()
    if (error) { await clearSession(chatId); await tgSend(token, chatId, `❌ Save nahi hui: ${error.message}`); return }
    prodId = prod.id
  }

  // replace this slot
  await supabase.from('production_slots').delete().eq('production_id', prodId).eq('slot_name', slotName)
  await supabase.from('production_slots').insert({
    production_id: prodId, slot_name: slotName,
    good_parts: good, rejection: rej, downtime: 0, remarks: '',
  })

  // recalc totals
  const { data: allSlots } = await supabase.from('production_slots').select('good_parts,rejection,downtime').eq('production_id', prodId)
  const sg = (allSlots || []).reduce((a, s) => a + (s.good_parts || 0), 0)
  const sr = (allSlots || []).reduce((a, s) => a + (s.rejection || 0), 0)
  const sd = (allSlots || []).reduce((a, s) => a + (s.downtime || 0), 0)
  const shots = cavities > 0 ? Math.round((sg + sr) / cavities) : 0
  await supabase.from('production').update({
    good_parts: Math.round(sg), rejection: Math.round(sr), downtime: Math.round(sd),
    shots_this_shift: shots, operator: data.operator || fromName,
  }).eq('id', prodId)

  await clearSession(chatId)
  await tgSend(token, chatId,
    `✅ <b>Production Entry Ho Gayi!</b>\\n\\n🏭 Plant 433\\n🔧 Machine: ${machine}\\n⚙️ Mould: ${data.mould_name || mould}\\n🕐 Slot: ${slotName} (${shift.includes('Day') ? 'Day' : 'Night'})\\n✅ Good: ${good}\\n❌ Rejection: ${rej}\\n👷 By: ${data.operator || fromName}\\n\\nDusra slot ya machine ke liye phir "production" likho.`
  )
}

// save rejection
async function saveRejection(token: string, chatId: string, data: any, fromName: string) {
  const plant = 'Plant 433'
  const { error } = await supabase.from('rejections').insert({
    date: istToday(), shift: '', plant,
    machine: data.machine || '', product: data.product || '',
    rejection_qty: parseFloat(data.rejection_qty) || 0,
    reason: data.reason || '', action_taken: '', notes: '',
    entered_by: 'Telegram - ' + (data.operator || fromName),
  })
  await clearSession(chatId)
  if (error) { await tgSend(token, chatId, `❌ Save nahi hui: ${error.message}`); return }
  await tgSend(token, chatId,
    `✅ <b>Rejection Entry Ho Gayi!</b>\\n\\n🏭 Plant 433\\n🔧 Machine: ${data.machine}\\n📦 Product: ${data.product}\\n❌ Rejection: ${data.rejection_qty} pcs\\n📋 Reason: ${data.reason}\\n👷 By: ${data.operator || fromName}\\n\\nAur entry ke liye "rejection" likho.`
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
    if (!session) return NextResponse.json({ ok: true })
    const data = session.data || {}
    const flow = session.flow

    // mould chosen (works for breakdown + production)
    if (cbData.startsWith('mould:')) {
      const code = cbData.slice(6)
      const m = MOULDS.find(x => x.code === code)
      data.mould_name = m ? m.name : ''
      data.mould_code = code
      if (flow === 'production') {
        const next = 2 // cavities step
        await setSession(chatId, 'production', next, data)
        await tgSend(token, chatId, `✅ Mould: ${m ? m.name : code} (${code})`)
        await askStep(token, chatId, next, 'production')
      } else {
        const next = 3 // breakdown problem step
        await setSession(chatId, 'breakdown', next, data)
        await tgSend(token, chatId, `✅ Mould: ${m ? m.name : code} (${code})`)
        await askStep(token, chatId, next, 'breakdown')
      }
      return NextResponse.json({ ok: true })
    }

    // generic option button (category / shift / slot)
    if (cbData.startsWith('opt:')) {
      const val = cbData.slice(4)
      if (flow === 'breakdown') {
        data.category = val
        const next = 5
        await setSession(chatId, 'breakdown', next, data)
        await tgSend(token, chatId, `✅ Category: ${val}`)
        await askStep(token, chatId, next, 'breakdown')
      } else if (flow === 'production') {
        // shift step (index 3)
        data.shift = val
        const next = 4 // slot step
        await setSession(chatId, 'production', next, data)
        await tgSend(token, chatId, `✅ Shift: ${val}`)
        // show slot buttons
        const slots = val.includes('Day') ? SLOTS_DAY : SLOTS_NIGHT
        const btns = inlineButtons(slots.map(s => ({ text: s, data: 'slot:' + s })))
        await tgSend(token, chatId, PROD_STEPS[4].q, btns)
      }
      return NextResponse.json({ ok: true })
    }

    // slot chosen (production)
    if (cbData.startsWith('slot:')) {
      data.slot = cbData.slice(5)
      const next = 5 // good parts step
      await setSession(chatId, 'production', next, data)
      await tgSend(token, chatId, `✅ Slot: ${data.slot}`)
      await askStep(token, chatId, next, 'production')
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
    await tgSend(token, chatId, '❌ Cancel kar diya. Naya shuru karne ke liye "production", "rejection" ya "breakdown" likho.')
    return NextResponse.json({ ok: true })
  }
  if (low === '/start' || low === 'help' || low === '/help') {
    await clearSession(chatId)
    await tgSend(token, chatId, `👋 Namaste ${fromName}!\n\n<b>Entry karne ke liye likho:</b>\n<code>production</code> — production entry (slot-wise)\n<code>rejection</code> — rejection entry\n<code>breakdown</code> — breakdown report\n\nBeech mein rokna ho toh "cancel" likho.`)
    return NextResponse.json({ ok: true })
  }

  const session = await getSession(chatId)

  // ── PRODUCTION flow ──
  if (session && session.flow === 'production') {
    const step = session.step || 0
    const data = session.data || {}
    const curField = PROD_STEPS[step]

    if (curField.key === 'mould') {
      const matches = MOULDS.filter(m => m.name.toLowerCase().includes(low) || m.code.includes(text)).slice(0, 8)
      if (matches.length === 0) {
        await tgSend(token, chatId, `🔍 "${text}" se koi mould nahi mila. Dobara naam/size type karo.`)
        return NextResponse.json({ ok: true })
      }
      const btns = inlineButtons(matches.map(m => ({ text: `${m.name} (${m.code})`, data: 'mould:' + m.code })))
      await tgSend(token, chatId, `👇 Mould chuno:`, btns)
      return NextResponse.json({ ok: true })
    }
    if (curField.key === 'shift') {
      await askStep(token, chatId, step, 'production') // show buttons again
      return NextResponse.json({ ok: true })
    }
    if (curField.key === 'slot') {
      const slots = (data.shift || '').includes('Day') ? SLOTS_DAY : SLOTS_NIGHT
      const btns = inlineButtons(slots.map(s => ({ text: s, data: 'slot:' + s })))
      await tgSend(token, chatId, PROD_STEPS[4].q, btns)
      return NextResponse.json({ ok: true })
    }

    data[curField.key] = text
    const nextStep = step + 1
    if (nextStep < PROD_STEPS.length) {
      await setSession(chatId, 'production', nextStep, data)
      // if next is shift, show buttons
      if (PROD_STEPS[nextStep].key === 'shift') await askStep(token, chatId, nextStep, 'production')
      else await askStep(token, chatId, nextStep, 'production')
      return NextResponse.json({ ok: true })
    }
    await saveProduction(token, chatId, data, fromName)
    return NextResponse.json({ ok: true })
  }

  // ── REJECTION flow ──
  if (session && session.flow === 'rejection') {
    const step = session.step || 0
    const data = session.data || {}
    const curField = REJ_STEPS[step]
    data[curField.key] = text
    const nextStep = step + 1
    if (nextStep < REJ_STEPS.length) {
      await setSession(chatId, 'rejection', nextStep, data)
      await askStep(token, chatId, nextStep, 'rejection')
      return NextResponse.json({ ok: true })
    }
    await saveRejection(token, chatId, data, fromName)
    return NextResponse.json({ ok: true })
  }

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

  if (low === 'production' || low === '/production' || low === 'prod') {
    await setSession(chatId, 'production', 0, {})
    await tgSend(token, chatId, `🏭 <b>Production Entry (Plant 433)</b>\n\nMain ek-ek karke sawaal poochunga. Rokna ho toh "cancel".\n\n${PROD_STEPS[0].q}`)
    return NextResponse.json({ ok: true })
  }

  if (low === 'rejection' || low === '/rejection' || low === 'rej') {
    await setSession(chatId, 'rejection', 0, {})
    await tgSend(token, chatId, `❌ <b>Rejection Entry (Plant 433)</b>\n\nMain ek-ek karke sawaal poochunga. Rokna ho toh "cancel".\n\n${REJ_STEPS[0].q}`)
    return NextResponse.json({ ok: true })
  }

  await tgSend(token, chatId, `🤔 Samajh nahi aaya.\n\nEntry ke liye likho:\n<code>production</code> — production entry\n<code>rejection</code> — rejection entry\n<code>breakdown</code> — breakdown report`)
  return NextResponse.json({ ok: true })
}

export async function GET() {
  return NextResponse.json({ ok: true, msg: 'Telegram webhook active' })
}
