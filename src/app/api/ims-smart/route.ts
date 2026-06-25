import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Month (0-11) → season. PEAK: Jul-Mar, OFF: Apr-Jun
function seasonForMonth(m: number): 'PEAK' | 'OFF' {
  // m: 0=Jan ... 3=Apr,4=May,5=Jun
  return (m >= 3 && m <= 5) ? 'OFF' : 'PEAK'
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || 'Finished'
    const monthParam = searchParams.get('month')
    const month = monthParam !== null ? parseInt(monthParam) : new Date().getMonth()
    const season = seasonForMonth(month)

    const { data: items } = await supabase.from('ims_smart')
      .select('*').eq('category', category).order('sort_order', { ascending: true })

    const out = (items || []).map(it => {
      const cons = season === 'PEAK' ? (it.cons_peak || 0) : (it.cons_off || 0)
      // MAX level (in packets) = consumption/day × lead time × safety
      const maxLevel = Math.round(cons * (it.lead_time || 7) * (it.safety_factor || 1.5))
      const stock = it.current_stock || 0
      let status = 'safe'
      if (maxLevel > 0) {
        if (stock <= 0) status = 'out'
        else if (stock < maxLevel * 0.33) status = 'critical'
        else if (stock < maxLevel * 0.66) status = 'low'
      }
      const orderQty = maxLevel > stock ? Math.round(maxLevel - stock) : 0
      return { ...it, season, consumption: cons, maxLevel, status, orderQty }
    })

    // ── Monthly movement grid (item × day) ──
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()))
    const mm = String(month + 1).padStart(2, '0')
    const startDate = `${year}-${mm}-01`
    const lastDay = new Date(year, month + 1, 0).getDate()
    const endDate = `${year}-${mm}-${String(lastDay).padStart(2, '0')}`
    const { data: logs } = await supabase.from('ims_smart_log')
      .select('date,item_name,total_pcs,physical_ctn,unpack_packets')
      .eq('category', category).gte('date', startDate).lte('date', endDate)
    // grid[item_name][day] = cartons
    const grid: Record<string, Record<number, number>> = {}
    for (const l of (logs || [])) {
      const day = parseInt(String(l.date).slice(8, 10))
      const it = (items || []).find(x => x.item_name === l.item_name)
      const ppc = it?.pcs_per_ctn || 0
      const cartons = ppc > 0 ? +(l.total_pcs / ppc).toFixed(1) : Math.round((l.total_pcs || 0) / 50)
      if (!grid[l.item_name]) grid[l.item_name] = {}
      grid[l.item_name][day] = cartons
    }

    // ── Today (selected date) ka pack/unpack/total detail ──
    const todayDate = searchParams.get('date') || new Date().toISOString().slice(0,10)
    const { data: todayLogs } = await supabase.from('ims_smart_log')
      .select('item_name,physical_ctn,unpack_packets,total_pcs')
      .eq('category', category).eq('date', todayDate)
    const todayMap: Record<string, any> = {}
    for (const l of (todayLogs || [])) {
      todayMap[l.item_name] = {
        pack: l.physical_ctn || 0,        // poore carton
        unpack: l.unpack_packets || 0,    // loose packets/cartons
        total: l.total_pcs || 0,          // total pcs
      }
    }

    return NextResponse.json({ success: true, season, month, year, daysInMonth: lastDay, items: out, grid, today: todayMap, todayDate })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()

    // Save daily stock snapshot + update current_stock
    if (body.type === 'save_stock') {
      const date = body.date
      const entries = body.entries || []
      let saved = 0
      for (const e of entries) {
        const totalPcs = (parseFloat(e.physical_ctn || 0) * parseFloat(e.pcs_per_ctn || 0)) + (parseFloat(e.unpack_packets || 0) * 50)
        // upsert log for the date
        const { data: existing } = await supabase.from('ims_smart_log')
          .select('id').eq('date', date).eq('item_name', e.item_name).eq('category', e.category).limit(1)
        if (existing && existing.length > 0) {
          await supabase.from('ims_smart_log').update({
            physical_ctn: e.physical_ctn || 0, unpack_packets: e.unpack_packets || 0,
            total_pcs: totalPcs, entered_by: body.user || ''
          }).eq('id', existing[0].id)
        } else {
          await supabase.from('ims_smart_log').insert({
            date, item_name: e.item_name, category: e.category,
            physical_ctn: e.physical_ctn || 0, unpack_packets: e.unpack_packets || 0,
            total_pcs: totalPcs, entered_by: body.user || ''
          })
        }
        // update current_stock in CARTONS (consumption is cartons/day)
        const stockCartons = (parseFloat(e.pcs_per_ctn||0)>0) ? +(totalPcs/parseFloat(e.pcs_per_ctn)).toFixed(2) : Math.round(totalPcs/50)
        await supabase.from('ims_smart').update({ current_stock: stockCartons, updated_at: new Date().toISOString() })
          .eq('item_name', e.item_name).eq('category', e.category)
        saved++
      }
      return NextResponse.json({ success: true, msg: `${saved} items ka stock saved!` })
    }

    // Update item settings (consumption, lead, safety)
    if (body.type === 'update_settings') {
      const e = body.item
      const { error } = await supabase.from('ims_smart').update({
        cons_peak: e.cons_peak || 0, cons_off: e.cons_off || 0,
        lead_time: e.lead_time || 7, safety_factor: e.safety_factor || 1.5,
        pcs_per_ctn: e.pcs_per_ctn || 0,
      }).eq('item_name', e.item_name).eq('category', e.category)
      if (error) return NextResponse.json({ success: false, msg: error.message })
      return NextResponse.json({ success: true, msg: 'Settings saved!' })
    }

    return NextResponse.json({ success: false, msg: 'Unknown type' })
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 })
  }
}
