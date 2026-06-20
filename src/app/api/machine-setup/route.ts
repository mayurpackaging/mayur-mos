import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0]
  const plant = searchParams.get('plant') || ''

  const { data: setup } = await supabase
    .from('machine_setup')
    .select('*')
    .eq('date', date)
    .eq('plant', plant)
    .order('machine')

  return NextResponse.json({ success: true, setup: setup || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date(Date.now() + 5.5*60*60*1000).toISOString().split('T')[0]

  if (d.type === 'setup') {
    const results = []
    for (const m of (d.machines || [])) {
      if (!m.machine) continue
      await supabase.from('machine_setup')
        .delete()
        .eq('date', d.date || today)
        .eq('plant', d.plant)
        .eq('machine', m.machine)

      const { error } = await supabase.from('machine_setup').insert({
        date: d.date || today,
        plant: d.plant,
        machine: m.machine,
        product: m.product || '',
        mould: m.mould || '',
        cavities: parseFloat(String(m.cavities)) || 0,
        cycle_time: parseFloat(String(m.cycleTime)) || 0,
        operator: m.operator || '',
        operator2: m.operator2 || '',
        valid_from_slot: m.validFromSlot || '8am-11am',
        created_by: d.createdBy || ''
      })
      if (error) return NextResponse.json({ success: false, msg: error.message })
      results.push(m.machine)
    }
    return NextResponse.json({ success: true, msg: `${results.length} machines setup saved!` })
  }

  if (d.type === 'bulk_slot') {
    let saved = 0
    const errors: string[] = []

    for (const entry of (d.entries || [])) {
      if (!entry.machine) continue
      if (!entry.good && !entry.rejection && !entry.down && entry.status === 'running') continue

      const slotGood = parseFloat(entry.good) || 0
      const slotRej = parseFloat(entry.rejection) || 0
      const slotDown = parseFloat(entry.down) || 0
      const cavities = parseFloat(entry.cavities) || 0

      const entryDate = d.date || today
      const entryShift = d.shift
      const entryPlant = d.plant
      const entryMachine = entry.machine
      const entryMould = entry.mould || ''
      const slotName = d.slot

      // ── VALIDATION 1: slot shift ke saath match kare ──
      const DAY_SLOTS = ['8am-11am','11am-2pm','2pm-5pm','5pm-8pm']
      const NIGHT_SLOTS = ['8pm-11pm','11pm-2am','2am-5am','5am-8am']
      const isNight = (entryShift||'').toLowerCase().includes('night')
      const validSlots = isNight ? NIGHT_SLOTS : DAY_SLOTS
      if (slotName && !validSlots.includes(slotName)) {
        errors.push(`${entryMachine}: "${slotName}" slot ${isNight?'Night':'Day'} shift mein nahi ho sakta`)
        continue
      }

      // ── VALIDATION 2: good_parts projected se zyada (10% margin) ──
      const ct = parseFloat(entry.cycleTime) || parseFloat(entry.cycle_time) || 0
      if (ct > 0 && cavities > 0 && slotGood > 0) {
        // ek slot = 3 ghante = 10800 sec
        const slotProj = Math.round(10800 / ct * cavities)
        const maxAllowed = Math.round(slotProj * 1.10)
        if (slotGood > maxAllowed) {
          errors.push(`${entryMachine} (${slotName}): ${slotGood} entry projected ${slotProj} se bahut zyada hai. Check karo.`)
          continue
        }
      }

      // ── Direct edit by id (from history edit) ──
      if (entry.editId) {
        await supabase.from('production_slots').delete()
          .eq('production_id', entry.editId).eq('slot_name', slotName)
        await supabase.from('production_slots').insert({
          production_id: entry.editId, slot_name: slotName,
          good_parts: Math.round(slotGood), rejection: Math.round(slotRej),
          downtime: Math.round(slotDown), remarks: entry.remarks || ''
        })
        // recalc totals
        const { data: sl } = await supabase.from('production_slots')
          .select('good_parts,rejection,downtime').eq('production_id', entry.editId)
        const g = (sl||[]).reduce((a,s)=>a+(s.good_parts||0),0)
        const r = (sl||[]).reduce((a,s)=>a+(s.rejection||0),0)
        const dn = (sl||[]).reduce((a,s)=>a+(s.downtime||0),0)
        await supabase.from('production').update({
          good_parts: Math.round(g), rejection: Math.round(r),
          downtime: Math.round(dn), remarks: entry.remarks || ''
        }).eq('id', entry.editId)
        saved++
        continue
      }

      // ── Find existing production row (same date+machine+shift+plant+mould+product) ──
      // product bhi match karte hain taaki colour change (same mould, naya product) ki alag row bane
      const { data: existRows } = await supabase.from('production')
        .select('id')
        .eq('date', entryDate).eq('machine', entryMachine)
        .eq('shift', entryShift).eq('plant', entryPlant)
        .eq('mould', entryMould).eq('product', entry.product || '')
        .order('created_at', { ascending: true }).limit(1)
      const existing = (existRows && existRows.length > 0) ? existRows[0] : null

      let prodId: string
      if (existing) {
        prodId = existing.id
      } else {
        const { data: prod, error } = await supabase.from('production').insert({
          date: entryDate, shift: entryShift, plant: entryPlant, machine: entryMachine,
          operator: entry.operator || '', operator2: entry.operator2 || '',
          product: entry.product || '', mould: entryMould,
          cavities: cavities, cycle_time: parseFloat(entry.cycleTime) || 0, material: '',
          good_parts: 0, rejection: 0, downtime: 0, shots_this_shift: 0,
          machine_status: entry.status || 'running',
          stop_reason: entry.stopReason || '', remarks: entry.remarks || '',
          entered_by: d.enteredBy || ''
        }).select().single()
        if (error) { errors.push(`${entry.machine}: ${error.message}`); continue }
        prodId = prod.id
      }

      // replace just this slot
      await supabase.from('production_slots').delete()
        .eq('production_id', prodId).eq('slot_name', slotName)
      await supabase.from('production_slots').insert({
        production_id: prodId, slot_name: slotName,
        good_parts: Math.round(slotGood), rejection: Math.round(slotRej),
        downtime: Math.round(slotDown), remarks: entry.remarks || ''
      })

      // recalc row totals from ALL slots
      const { data: allSlots } = await supabase.from('production_slots')
        .select('good_parts,rejection,downtime').eq('production_id', prodId)
      const sumGood = (allSlots||[]).reduce((a,s)=>a+(s.good_parts||0),0)
      const sumRej = (allSlots||[]).reduce((a,s)=>a+(s.rejection||0),0)
      const sumDown = (allSlots||[]).reduce((a,s)=>a+(s.downtime||0),0)
      const sumShots = cavities > 0 ? Math.round((sumGood+sumRej)/cavities) : 0

      await supabase.from('production').update({
        good_parts: Math.round(sumGood), rejection: Math.round(sumRej),
        downtime: Math.round(sumDown), shots_this_shift: sumShots,
        machine_status: entry.status || 'running',
        stop_reason: entry.stopReason || '',
        product: entry.product || '', mould: entryMould,
        operator: entry.operator || '', operator2: entry.operator2 || '',
      }).eq('id', prodId)

      saved++
    }

    if (saved > 0 && errors.length > 0) return NextResponse.json({ success: true, msg: `${saved} slot saved. ⚠️ ${errors.length} reject hue:\n${errors.join('\n')}` })
    if (saved > 0) return NextResponse.json({ success: true, msg: `${saved} machines ka ${d.slot} slot saved!` })
    return NextResponse.json({ success: false, msg: errors[0] || 'Koi data nahi bhara!' })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
