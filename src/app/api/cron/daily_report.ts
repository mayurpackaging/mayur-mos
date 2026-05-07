import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const RESEND_API_KEY = process.env.RESEND_API_KEY || ''
const ADMIN_EMAIL = 'mayurshreeja@gmail.com'

export async function GET(req: Request) {
  // Verify this is called by Vercel Cron
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]

  const { data: prod } = await supabase.from('production').select('plant,good_parts,rejection,shift').eq('date', today)
  const { data: bd } = await supabase.from('breakdowns').select('status,downtime_min').eq('date', today)
  const { data: mc } = await supabase.from('mould_changes').select('on_time').eq('date', today)
  const { data: pm } = await supabase.from('mould_master').select('status,mould_name,plant').eq('status', 'OVERDUE')
  const { data: imsLow } = await supabase.from('ims_stock').select('item_name,stock_cartons').eq('date', today).lte('stock_cartons', 5)

  const totalGood = prod?.reduce((a,r)=>a+(r.good_parts||0),0)||0
  const totalRej = prod?.reduce((a,r)=>a+(r.rejection||0),0)||0
  const rejPct = (totalGood+totalRej)>0?Math.round(totalRej/(totalGood+totalRej)*100*10)/10:0
  const bdPending = bd?.filter(r=>r.status==='Pending').length||0
  const totalDown = bd?.reduce((a,r)=>a+(r.downtime_min||0),0)||0
  const mcTotal = mc?.length||0
  const mcOnTime = mc?.filter(r=>r.on_time==='Yes').length||0
  const pmOverdue = pm?.length||0

  // Alerts section
  const alerts = []
  if (bdPending > 0) alerts.push(`🔧 ${bdPending} breakdown pending!`)
  if (pmOverdue > 0) alerts.push(`⚙️ ${pmOverdue} moulds PM overdue!`)
  if ((imsLow?.length||0) > 0) alerts.push(`📦 ${imsLow?.length} items critical stock!`)

  const alertsHtml = alerts.length > 0 ? `
    <div style="background:#FFEBEE;border:2px solid #C00000;border-radius:8px;padding:12px;margin-bottom:16px">
      <strong style="color:#C00000">🚨 Alerts:</strong><br>
      ${alerts.map(a=>`<div style="color:#C00000;padding:2px 0">${a}</div>`).join('')}
    </div>
  ` : `<div style="background:#E8F5E9;border:1px solid #276221;border-radius:8px;padding:12px;margin-bottom:16px;color:#276221;font-weight:bold">✅ Sab theek hai aaj!</div>`

  const html = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto">
      <div style="background:#1F3864;color:#fff;padding:20px;border-radius:8px 8px 0 0">
        <h2 style="margin:0">🏭 Mayur MOS — Daily Report</h2>
        <p style="margin:4px 0 0;opacity:0.8">${today} | Auto-generated at 8:00 AM</p>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #E0E0E0;border-top:none">
        ${alertsHtml}
        <table style="width:100%;border-collapse:collapse">
          <tr style="background:#F5F5F5"><td style="padding:10px;font-weight:bold;border:1px solid #E0E0E0">✅ Good Parts</td><td style="padding:10px;border:1px solid #E0E0E0;color:#276221;font-weight:bold;font-size:16px">${totalGood.toLocaleString()} pcs</td></tr>
          <tr><td style="padding:10px;font-weight:bold;border:1px solid #E0E0E0">❌ Rejection</td><td style="padding:10px;border:1px solid #E0E0E0;color:${rejPct>3?'#C00000':'#276221'};font-weight:bold;font-size:16px">${rejPct}%</td></tr>
          <tr style="background:#F5F5F5"><td style="padding:10px;font-weight:bold;border:1px solid #E0E0E0">🔧 Breakdown</td><td style="padding:10px;border:1px solid #E0E0E0">${bdPending} pending | ${totalDown} min</td></tr>
          <tr><td style="padding:10px;font-weight:bold;border:1px solid #E0E0E0">🔄 Mould Change</td><td style="padding:10px;border:1px solid #E0E0E0">${mcOnTime}/${mcTotal} on time</td></tr>
          <tr style="background:#F5F5F5"><td style="padding:10px;font-weight:bold;border:1px solid #E0E0E0">⚙️ PM Overdue</td><td style="padding:10px;border:1px solid #E0E0E0;color:${pmOverdue>0?'#C00000':'#276221'};font-weight:bold">${pmOverdue} moulds</td></tr>
        </table>
        ${pmOverdue>0?`<div style="margin-top:12px"><strong>Overdue Moulds:</strong> ${pm?.map(m=>m.mould_name).join(', ')}</div>`:''}
        <br>
        <a href="https://mayur-mos.vercel.app" style="background:#1F3864;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block">MOS Dashboard Kholo →</a>
      </div>
      <div style="background:#F5F5F5;padding:12px 20px;border-radius:0 0 8px 8px;font-size:12px;color:#666;border:1px solid #E0E0E0;border-top:none">
        Mayur Food Packaging Products | Bawana, Delhi | mayur-mos.vercel.app
      </div>
    </div>
  `

  // Send email
  const emailRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'onboarding@resend.dev', to: [ADMIN_EMAIL], subject: `MOS Daily Report — ${today}`, html })
  }).then(r=>r.json())

  return NextResponse.json({ 
    success: !!emailRes.id, 
    msg: emailRes.id ? `Daily report sent! Date: ${today}` : JSON.stringify(emailRes)
  })
}
