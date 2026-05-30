import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PLANTS = ['Plant 477', 'Plant 488', 'Plant 433']
const DAY_SLOTS = ['8am-11am', '11am-2pm', '2pm-5pm', '5pm-8pm']
const NIGHT_SLOTS = ['8pm-11pm', '11pm-2am', '2am-5am', '5am-8am']
const MACH: Record<string, string[]> = {
  'Plant 477': ['M1-Sumitomo 180T','M2-Sumitomo 180T','M3-Sumitomo 180T','M4-Sumitomo 280T','M5-JSW 180T','M6-Sumitomo 180T'],
  'Plant 488': ['M1-Sumitomo 180T','M2-Sumitomo 180T','M3-JSW 350T','M4-Sumitomo 180T','M5-Sumitomo 350T','M6-JSW 350T','M7-JSW 350T'],
  'Plant 433': ['M1-Milacron N200T','M2-Milacron N200T'],
}

function istToday() {
  const now = new Date()
  const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000)
  return ist.toISOString().split('T')[0]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || istToday()

  // Settings
  const { data: settingsRow } = await supabase.from('process_settings').select('*').eq('id', 'default').maybeSingle()
  const settings = settingsRow || {}

  const base = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin

  // Fetch all data for the date in parallel.
  // Quality & spares use their own API routes (avoids table-name mismatch).
  const [prodRes, qualApi, bdRes, imsRes, rejRes, sparesApi, mouldRes] = await Promise.all([
    supabase.from('production').select('id,plant,machine,shift,good_parts,rejection,entered_by').eq('date', date),
    fetch(`${base}/api/quality?report=1&from=${date}&to=${date}`).then(r => r.json()).catch(() => ({ data: [] })),
    supabase.from('breakdowns').select('id,machine,plant,problem,analysis,solution,status,reported_time,downtime_min').eq('date', date),
    supabase.from('ims_stock').select('plant,item_name,entered_by').eq('date', date),
    supabase.from('rejections').select('plant,machine,rejection_qty,entered_by').eq('date', date),
    fetch(`${base}/api/spares`).then(r => r.json()).catch(() => ({ recentMovements: [] })),
    supabase.from('mould_master').select('mould_name,current_shots,next_pm_at_shots,pm_frequency_shots,plant'),
  ])

  const prod = prodRes.data || []
  const qual = (qualApi.data || [])
  const bd = bdRes.data || []
  const ims = imsRes.data || []
  const rej = rejRes.data || []
  const spares = (sparesApi.recentMovements || sparesApi.movements || []).filter((s: any) => (s.date || '').slice(0, 10) === date)
  const moulds = mouldRes.data || []

  // Fetch slots for today's production rows
  const prodIds = prod.map((p: any) => p.id).filter(Boolean)
  let slotsData: any[] = []
  if (prodIds.length > 0) {
    const { data: sd } = await supabase.from('production_slots').select('production_id,slot_name').in('production_id', prodIds)
    slotsData = sd || []
  }
  // map production_id -> {plant, shift}
  const prodMap: Record<string, any> = {}
  prod.forEach((p: any) => { prodMap[p.id] = p })

  // ── PRODUCTION (plant-wise, slot-wise via production_slots join) ──
  const production = PLANTS.map(plant => {
    // slots done for this plant, split by shift
    const dayDoneSlots = new Set<string>()
    const nightDoneSlots = new Set<string>()
    slotsData.forEach((s: any) => {
      const par = prodMap[s.production_id]
      if (!par || par.plant !== plant) return
      if ((par.shift || '').toLowerCase().includes('night')) nightDoneSlots.add(s.slot_name)
      else dayDoneSlots.add(s.slot_name)
    })
    const dayMissing = DAY_SLOTS.filter(sl => !dayDoneSlots.has(sl))
    const nightMissing = NIGHT_SLOTS.filter(sl => !nightDoneSlots.has(sl))
    const pp = prod.filter((e: any) => e.plant === plant)
    return {
      plant,
      dayDone: DAY_SLOTS.length - dayMissing.length, dayTotal: DAY_SLOTS.length, dayMissing,
      nightDone: NIGHT_SLOTS.length - nightMissing.length, nightTotal: NIGHT_SLOTS.length, nightMissing,
      entries: pp.length,
      goodParts: pp.reduce((a: number, e: any) => a + (e.good_parts || 0), 0),
    }
  })

  // ── QUALITY (plant-wise) ──
  const quality = PLANTS.map(plant => {
    const qp = qual.filter((e: any) => (e.plant === plant) || (e.machine || '').startsWith(plant))
    const slots = Array.from(new Set(qp.map((e: any) => e.check_time).filter(Boolean)))
    const ng = qp.filter((e: any) => e.overall_result === 'NG').length
    return { plant, checks: qp.length, slots: slots.length, ng }
  })

  // ── BREAKDOWN ──
  const bdPending = bd.filter((b: any) => b.status !== 'Resolved')
  const bdNoAnalysis = bd.filter((b: any) => b.status === 'Resolved' && (!b.analysis || b.analysis === '--' || b.analysis === ''))
  const breakdown = {
    total: bd.length,
    pending: bdPending.length,
    resolved: bd.filter((b: any) => b.status === 'Resolved').length,
    noAnalysis: bdNoAnalysis.length,
    pendingList: bdPending.map((b: any) => ({ machine: b.machine, plant: b.plant, problem: b.problem })),
  }

  // ── MOULD PM (due / overdue) ──
  const pmDue = moulds.map((m: any) => {
    const curr = m.current_shots || 0
    const pmAt = m.next_pm_at_shots || 0
    const freq = m.pm_frequency_shots || 0
    const remaining = pmAt - curr
    const status = remaining <= 0 ? 'OVERDUE' : (freq > 0 && remaining < freq * 0.1) ? 'DUE SOON' : 'OK'
    return { mould: m.mould_name, plant: m.plant, remaining, status }
  }).filter((m: any) => m.status !== 'OK')
  const mouldPM = {
    overdue: pmDue.filter((m: any) => m.status === 'OVERDUE').length,
    dueSoon: pmDue.filter((m: any) => m.status === 'DUE SOON').length,
    list: pmDue,
  }

  // ── IMS (combined) ──
  const imsPlants = Array.from(new Set(ims.map((e: any) => e.plant).filter(Boolean)))
  const imsStatus = { done: ims.length > 0, entries: ims.length, plants: imsPlants }

  // ── REJECTION (combined) ──
  const rejStatus = { done: rej.length > 0, entries: rej.length, totalQty: rej.reduce((a: number, r: any) => a + (r.rejection_qty || 0), 0) }

  // ── SPARES (combined) ──
  const sparesIn = spares.filter((s: any) => s.action === 'Stock In')
  const sparesOut = spares.filter((s: any) => s.action !== 'Stock In')
  const sparesStatus = { entries: spares.length, stockIn: sparesIn.length, used: sparesOut.length }

  return NextResponse.json({
    success: true,
    date,
    settings,
    production,
    quality,
    breakdown,
    mouldPM,
    ims: imsStatus,
    rejection: rejStatus,
    spares: sparesStatus,
  })
}

export async function POST(req: Request) {
  const d = await req.json()
  if (d.type === 'save_settings') {
    const { error } = await supabase.from('process_settings').upsert({
      id: 'default',
      ims_due_time: d.ims_due_time,
      quality_due_time: d.quality_due_time,
      rejection_due_time: d.rejection_due_time,
      spares_due_time: d.spares_due_time,
      breakdown_max_pending_min: d.breakdown_max_pending_min,
      production_slot_grace_min: d.production_slot_grace_min,
      updated_by: d.updatedBy || '',
      updated_at: new Date().toISOString(),
    })
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Settings saved!' })
  }
  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
