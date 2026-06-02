import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

const PLANTS = ['Plant 477', 'Plant 488', 'Plant 433']

function istToday() {
  return new Date(Date.now() + 5.5*60*60*1000).toISOString().split('T')[0]
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '7')
  const today = istToday()
  const fromDate = new Date(Date.now() + 5.5*60*60*1000 - (days-1)*24*60*60*1000).toISOString().split('T')[0]

  // production rejection (machine + plant + date)
  const { data: prod } = await supabase.from('production')
    .select('date,plant,machine,rejection').gte('date', fromDate).lte('date', today)

  // rejections table entries
  const { data: rej } = await supabase.from('rejections')
    .select('date,plant,machine,rejection_qty').gte('date', fromDate).lte('date', today)

  // last rejection entry date overall
  const { data: lastRej } = await supabase.from('rejections')
    .select('date').order('date', { ascending: false }).limit(1)
  const lastEntryDate = lastRej?.[0]?.date || 'Never'

  // build date list
  const dates: string[] = []
  for (let i = 0; i < days; i++) {
    dates.push(new Date(Date.now() + 5.5*60*60*1000 - i*24*60*60*1000).toISOString().split('T')[0])
  }

  // per date+plant: prod rejection vs entry rejection
  const rows: any[] = []
  dates.forEach(date => {
    PLANTS.forEach(plant => {
      const prodRej = (prod||[]).filter((r:any)=>r.date===date&&r.plant===plant)
        .reduce((a:number,r:any)=>a+(r.rejection||0),0)
      const entryRej = (rej||[]).filter((r:any)=>r.date===date&&r.plant===plant)
        .reduce((a:number,r:any)=>a+(r.rejection_qty||0),0)
      const hasProd = (prod||[]).some((r:any)=>r.date===date&&r.plant===plant)
      const hasEntry = (rej||[]).some((r:any)=>r.date===date&&r.plant===plant)
      if (!hasProd && !hasEntry) return // skip days with no data at all
      rows.push({
        date, plant,
        prodRej, entryRej,
        diff: prodRej - entryRej,
        hasEntry,
        entryMissing: hasProd && !hasEntry,
      })
    })
  })

  // machine-wise difference for today (and per plant)
  const machineRows: any[] = []
  PLANTS.forEach(plant => {
    const machines = Array.from(new Set([
      ...(prod||[]).filter((r:any)=>r.date===today&&r.plant===plant).map((r:any)=>r.machine),
      ...(rej||[]).filter((r:any)=>r.date===today&&r.plant===plant).map((r:any)=>r.machine),
    ].filter(Boolean)))
    machines.forEach(machine => {
      const pr = (prod||[]).filter((r:any)=>r.date===today&&r.plant===plant&&r.machine===machine)
        .reduce((a:number,r:any)=>a+(r.rejection||0),0)
      const er = (rej||[]).filter((r:any)=>r.date===today&&r.plant===plant&&r.machine===machine)
        .reduce((a:number,r:any)=>a+(r.rejection_qty||0),0)
      machineRows.push({ plant, machine, prodRej: pr, entryRej: er, diff: pr - er })
    })
  })

  // missing days (had production but no rejection entry)
  const missingDays = rows.filter(r=>r.entryMissing)

  return NextResponse.json({
    success: true, today, fromDate, lastEntryDate,
    rows, machineRows, missingDays,
  })
}
