import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const DEPARTMENTS = ['production', 'quality', 'rejection', 'spares', 'breakdown', 'mouldpm', 'ims']

function istToday() {
  const ist = new Date(Date.now() + 5.5 * 60 * 60 * 1000)
  return ist.toISOString().split('T')[0]
}

// Send a single Telegram message
async function sendTelegram(token: string, chatId: string, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    })
    const j = await res.json()
    return j.ok === true
  } catch (e) {
    return false
  }
}

// Build per-department pending message from processcheck data
function buildDeptMessage(dept: string, pc: any): string | null {
  const date = pc.date
  if (dept === 'production') {
    const pending = (pc.production || []).filter((p: any) => p.dayDone < p.dayTotal)
    if (pending.length === 0) return null
    let msg = `🏭 <b>Production Entry Pending</b> (${date})\n\n`
    pending.forEach((p: any) => {
      msg += `<b>${p.plant}</b>: ${p.dayDone}/${p.dayTotal} slots done\n⏳ Pending: ${p.dayMissing.join(', ')}\n\n`
    })
    msg += `Kripya entry update karein.`
    return msg
  }
  if (dept === 'quality') {
    const pending = (pc.quality || []).filter((q: any) => q.done < q.total)
    if (pending.length === 0) return null
    let msg = `🔬 <b>Quality Check Pending</b> (${date})\n\n`
    pending.forEach((q: any) => {
      msg += `<b>${q.plant}</b>: ${q.done}/${q.total} slots done\n⏳ Pending: ${q.missing.join(', ')}\n\n`
    })
    msg += `Kripya QC check karein.`
    return msg
  }
  if (dept === 'ims') {
    if (pc.ims?.done) return null
    return `📦 <b>IMS Stock Entry Pending</b> (${date})\n\nAaj ka stock entry abhi tak nahi hua. Kripya update karein.`
  }
  if (dept === 'rejection') {
    if (pc.rejection?.done) return null
    return `❌ <b>Rejection Entry Pending</b> (${date})\n\nAaj koi rejection entry nahi hui. Agar rejection hai toh entry karein.`
  }
  if (dept === 'breakdown') {
    if (!pc.breakdown || pc.breakdown.pending === 0) return null
    let msg = `🔧 <b>Breakdown Pending</b> (${date})\n\n${pc.breakdown.pending} breakdown abhi pending hain:\n`
    ;(pc.breakdown.pendingList || []).forEach((b: any) => {
      msg += `• ${b.machine} (${b.plant}) — ${b.problem}\n`
    })
    return msg
  }
  if (dept === 'mouldpm') {
    if (!pc.mouldPM || pc.mouldPM.overdue === 0) return null
    let msg = `⚙️ <b>Mould PM Overdue</b> (${date})\n\n${pc.mouldPM.overdue} mould overdue:\n`
    ;(pc.mouldPM.list || []).filter((m: any) => m.status === 'OVERDUE').forEach((m: any) => {
      msg += `• ${m.mould}${m.plant ? ' · ' + m.plant : ''}\n`
    })
    return msg
  }
  if (dept === 'spares') {
    return null // spares optional, no nag
  }
  return null
}

export async function GET(req: Request) {
  // List staff
  const { data } = await supabase.from('staff_telegram').select('*').order('department').order('staff_name')
  const { data: settings } = await supabase.from('process_settings').select('telegram_bot_token').eq('id', 'default').maybeSingle()
  return NextResponse.json({ success: true, staff: data || [], hasToken: !!(settings?.telegram_bot_token) })
}

export async function POST(req: Request) {
  const d = await req.json()

  // ── Add staff ──
  if (d.type === 'add_staff') {
    const { error } = await supabase.from('staff_telegram').insert({
      department: d.department, staff_name: d.staffName, chat_id: d.chatId, plant: d.plant || '', active: true,
    })
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Staff added!' })
  }

  // ── Delete staff ──
  if (d.type === 'delete_staff') {
    const { error } = await supabase.from('staff_telegram').delete().eq('id', d.id)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Removed!' })
  }

  // ── Save bot token ──
  if (d.type === 'save_token') {
    const { error } = await supabase.from('process_settings').upsert({ id: 'default', telegram_bot_token: d.token })
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Bot token saved!' })
  }

  // ── Send pending reminders (manual button OR cron) ──
  if (d.type === 'send_reminders') {
    const date = d.date || istToday()
    const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin

    // token
    const { data: settings } = await supabase.from('process_settings').select('telegram_bot_token').eq('id', 'default').maybeSingle()
    const token = settings?.telegram_bot_token || ''
    if (!token) return NextResponse.json({ success: false, msg: 'Bot token set nahi hai!' })

    // process status
    const pc = await fetch(`${base}/api/processcheck?date=${date}`).then(r => r.json()).catch(() => null)
    if (!pc || !pc.success) return NextResponse.json({ success: false, msg: 'Process status load nahi hua' })

    // staff
    const { data: staff } = await supabase.from('staff_telegram').select('*').eq('active', true)
    if (!staff || staff.length === 0) return NextResponse.json({ success: false, msg: 'Koi staff add nahi hai!' })

    // build per-department messages
    const deptMsg: Record<string, string | null> = {}
    DEPARTMENTS.forEach(dep => { deptMsg[dep] = buildDeptMessage(dep, pc) })

    let sent = 0, skipped = 0, failed = 0
    for (const st of staff) {
      const msg = deptMsg[st.department]
      if (!msg) { skipped++; continue }
      // if staff has a plant filter, only relevant — but message already covers all plants; keep simple
      const ok = await sendTelegram(token, st.chat_id, msg)
      if (ok) sent++; else failed++
    }

    return NextResponse.json({ success: true, msg: `Sent: ${sent}, skipped (kuch pending nahi): ${skipped}, failed: ${failed}` })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
