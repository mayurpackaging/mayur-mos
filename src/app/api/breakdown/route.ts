import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Extract job_no from mould_running string like "750 ml Tub (6374)"
function extractJobNo(mouldRunning: string): string {
  if (!mouldRunning) return ''
  const match = mouldRunning.match(/\((\d+)\)/)
  return match ? match[1] : ''
}

function extractMouldName(mouldRunning: string): string {
  if (!mouldRunning) return ''
  return mouldRunning.split('(')[0].trim()
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') || ''
  const from = searchParams.get('from') || ''
  const to = searchParams.get('to') || ''

  if (from && to) {
    const { data } = await supabase.from('breakdowns')
      .select('*').gte('date', from).lte('date', to)
      .order('date', { ascending: true })
    return NextResponse.json({ success: true, data: data || [] })
  }

  let q = supabase.from('breakdowns').select('*').order('created_at', { ascending: false }).limit(100)
  if (date) q = q.eq('date', date)

  const { data } = await q
  return NextResponse.json({ success: true, data: data || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  // IST timezone fix — UTC+5:30
  const now = new Date()
  const istOffset = 5.5 * 60 * 60 * 1000
  const istDate = new Date(now.getTime() + istOffset)
  const today = istDate.toISOString().split('T')[0]

  // Report new breakdown
  if (d.type === 'report') {
    const now = new Date().toISOString()
    const { data: bd, error } = await supabase.from('breakdowns').insert({
      date: d.date || today,
      plant: d.plant || '',
      machine: d.machine || '',
      mould_running: d.mouldRunning || '',
      problem: d.problem || '',
      category: d.category || 'Mechanical',
      operator_name: d.operator || '',
      reported_time: now,
      status: 'Pending',
      reported_by: d.enteredBy || '',
      remarks: d.remarks || ''
    }).select().single()

    if (error) return NextResponse.json({ success: false, msg: error.message })

    // ✅ Auto save to mould_history if mould was running
    if (d.mouldRunning) {
      const jobNo = extractJobNo(d.mouldRunning)
      const mouldName = extractMouldName(d.mouldRunning)
      if (jobNo) {
        await supabase.from('mould_history').insert({
          mould_no: '---',
          job_no: jobNo,
          mould_name: mouldName,
          record_date: d.date || today,
          pdf_source: 'LIVE',
          record_type: 'BD',
          machine_no: d.machine || '',
          issue: d.problem || '',
          work_done: 'Breakdown reported — resolution pending',
          parts_changed: '',
          result: 'Pending',
          remarks: 'BD ID: ' + (bd?.bd_id || bd?.id?.slice(0,8) || '') + ' | Plant: ' + (d.plant || '') + ' | Reported by: ' + (d.enteredBy || '')
        })
      }
    }

    // Send alert email if configured
    try {
      await fetch((process.env.NEXT_PUBLIC_SITE_URL || '') + '/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'breakdown', breakdown: bd })
      })
    } catch(e) {}

    return NextResponse.json({ success: true, msg: 'Breakdown reported! Alert sent.' })
  }

  // Mark work started
  if (d.type === 'start_work') {
    const { error } = await supabase.from('breakdowns').update({
      work_started_time: new Date().toISOString(),
      status: 'In Progress'
    }).eq('id', d.id)

    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Work started — time stamp saved!' })
  }

  // Resolve breakdown
  if (d.type === 'resolve') {
    const resolvedTime = new Date().toISOString()

    // Get full breakdown record for mould_history update
    const { data: bd } = await supabase
      .from('breakdowns')
      .select('*')
      .eq('id', d.id)
      .single()

    const reportedTime = bd?.reported_time || resolvedTime
    const downtimeMins = Math.round((new Date(resolvedTime).getTime() - new Date(reportedTime).getTime()) / 60000)

    const { error } = await supabase.from('breakdowns').update({
      resolved_time: resolvedTime,
      status: 'Resolved',
      solution: d.solution || '',
      analysis: d.analysis || '',
      spares_used: d.sparesUsed || '',
      downtime_min: downtimeMins,
      resolved_by: d.enteredBy || '',
      remarks: d.remarks || ''
    }).eq('id', d.id)

    if (error) return NextResponse.json({ success: false, msg: error.message })

    // ✅ Update mould_history — find existing BD record and update it
    // OR create new resolved record if mould was running
    if (bd?.mould_running) {
      const jobNo = extractJobNo(bd.mould_running)
      const mouldName = extractMouldName(bd.mould_running)

      if (jobNo) {
        const bdRef = bd.bd_id || bd.id?.slice(0, 8) || ''

        // Try to update existing mould_history record for this breakdown
        const { data: existing } = await supabase
          .from('mould_history')
          .select('id')
          .eq('job_no', jobNo)
          .eq('record_type', 'BD')
          .ilike('remarks', '%' + bdRef + '%')
          .maybeSingle()

        if (existing) {
          // Update existing record with solution
          await supabase.from('mould_history').update({
            work_done: d.solution || '',
            parts_changed: d.sparesUsed || '',
            result: 'Fixed',
            remarks: 'BD ID: ' + bdRef + ' | Downtime: ' + downtimeMins + 'min | By: ' + (d.enteredBy || '') + ' | Plant: ' + (bd.plant || '')
          }).eq('id', existing.id)
        } else {
          // Create new resolved record
          await supabase.from('mould_history').insert({
            mould_no: '---',
            job_no: jobNo,
            mould_name: mouldName,
            record_date: bd.date || today,
            pdf_source: 'LIVE',
            record_type: 'BD',
            machine_no: bd.machine || '',
            issue: bd.problem || '',
            work_done: d.solution || '',
            parts_changed: d.sparesUsed || '',
            result: 'Fixed',
            remarks: 'BD ID: ' + bdRef + ' | Downtime: ' + downtimeMins + 'min | By: ' + (d.enteredBy || '') + ' | Plant: ' + (bd.plant || '')
          })
        }
      }
    }

    // Handle resolved parts — stock minus + logs
    if (d.resolvedParts && d.resolvedParts.length > 0) {
      const today2 = new Date().toISOString().split('T')[0]
      for (const part of d.resolvedParts) {
        if (!part.partName || !part.qty) continue
        const qty = parseFloat(part.qty) || 0
        const isMouldPart = (part.category || '').includes('Mould')

        // Update spares stock
        const { data: spare } = await supabase
          .from('spares_master').select('*').ilike('part_name', part.partName).maybeSingle()

        if (spare) {
          const newStock = Math.max(0, (spare.current_stock || 0) - qty)
          const status = newStock === 0 ? 'Out of Stock' : newStock < (spare.min_qty || 0) ? 'Low' : 'OK'
          await supabase.from('spares_master').update({
            current_stock: newStock, status, last_updated: new Date().toISOString()
          }).eq('id', spare.id)

          // Spare movement
          await supabase.from('spare_movements').insert({
            date: bd?.date || today2,
            part_name: part.partName,
            category: part.category || '',
            action: 'Used in Machine',
            qty,
            done_by: d.enteredBy || '',
            new_stock: newStock,
            plant: bd?.plant || '',
            machine: bd?.machine || '',
            mould_no: bd?.mould_running || '',
            mould_name: bd?.mould_running ? bd.mould_running.split('(')[0].trim() : '',
            used_for: isMouldPart ? 'Mould' : 'Machine'
          })
        }

        // Mould part → mould_history RM
        if (isMouldPart && bd?.mould_running) {
          const jobMatch = bd.mould_running.match(/\((\d+)\)/)
          const jobNo = jobMatch ? jobMatch[1] : ''
          const mouldName = bd.mould_running.split('(')[0].trim()
          if (jobNo) {
            await supabase.from('mould_history').insert({
              mould_no: '---',
              job_no: jobNo,
              mould_name: mouldName,
              record_date: bd.date || today2,
              pdf_source: 'LIVE',
              record_type: 'RM',
              machine_no: bd.machine || '',
              issue: 'Parts replaced during breakdown',
              work_done: 'BD Resolve: ' + (d.solution || ''),
              parts_changed: part.partName + ' x' + qty,
              result: 'Done',
              remarks: 'BD ID: ' + (bd.bd_id || String(bd.id).slice(0,8)) + ' | By: ' + (d.enteredBy || '')
            })
          }
        }

        // Machine part → maintenance_logs
        if (!isMouldPart) {
          await supabase.from('maintenance_logs').insert({
            date: bd?.date || today2,
            plant: bd?.plant || '',
            machine: bd?.machine || '',
            section: part.category || 'General',
            check_point: 'Part replaced during breakdown: ' + part.partName + ' x' + qty,
            result: 'Replaced',
            remarks: 'BD ID: ' + (bd?.bd_id || String(bd?.id).slice(0,8)) + ' | ' + (d.solution || ''),
            done_by: d.enteredBy || '',
            frequency: 'Breakdown'
          })
        }
      }
    }

    return NextResponse.json({ success: true, msg: 'Resolved! Downtime: ' + downtimeMins + ' min' })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
