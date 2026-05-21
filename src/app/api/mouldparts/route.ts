import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const job_no = searchParams.get('job_no')
  if (!job_no) return NextResponse.json({ error: 'job_no required' }, { status: 400 })

  const [{ data: parts }, { data: changes }] = await Promise.all([
    supabase.from('mould_parts').select('*').eq('job_no', job_no).order('part_type'),
    supabase.from('mould_part_changes').select('*').eq('job_no', job_no).order('changed_date', { ascending: false }).limit(50)
  ])

  return NextResponse.json({ parts: parts || [], changes: changes || [] })
}

export async function POST(req: Request) {
  const d = await req.json()
  const today = new Date().toISOString().split('T')[0]

  // Add new part to mould
  if (d.type === 'add_part') {
    const { data, error } = await supabase.from('mould_parts').insert({
      job_no: d.job_no,
      mould_name: d.mould_name || '',
      part_type: d.part_type || '',
      part_name: d.part_name || '',
      size_spec: d.size_spec || '',
      qty_installed: parseFloat(d.qty_installed) || 1,
      installed_date: d.installed_date || today,
      last_changed_date: d.installed_date || today,
      last_changed_by: d.done_by || '',
      total_changes: 0,
      remarks: d.remarks || ''
    }).select().single()
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Part added!', data })
  }

  // Record part change
  if (d.type === 'change_part') {
    // 1. Add to change history
    await supabase.from('mould_part_changes').insert({
      job_no: d.job_no,
      mould_name: d.mould_name || '',
      part_name: d.part_name || '',
      part_type: d.part_type || '',
      changed_date: d.changed_date || today,
      reason: d.reason || '',
      changed_by: d.changed_by || '',
      shots_at_change: parseFloat(d.shots_at_change) || 0,
      old_spec: d.old_spec || '',
      new_spec: d.new_spec || '',
      remarks: d.remarks || '',
      bd_ref: d.bd_ref || ''
    })

    // 2. Update mould_parts last changed
    await supabase.from('mould_parts')
      .update({
        last_changed_date: d.changed_date || today,
        last_changed_by: d.changed_by || '',
        total_changes: supabase.rpc('increment', { row_id: d.part_id }) as any,
        size_spec: d.new_spec || undefined,
        remarks: d.remarks || undefined
      }).eq('id', d.part_id)

    // 3. Also save to mould_history as RM
    await supabase.from('mould_history').insert({
      mould_no: '---',
      job_no: d.job_no,
      mould_name: d.mould_name || '',
      record_date: d.changed_date || today,
      pdf_source: 'LIVE',
      record_type: 'RM',
      machine_no: d.machine_no || '',
      issue: 'Part changed: ' + d.part_name,
      work_done: d.reason || '',
      parts_changed: d.part_name + (d.new_spec ? ' (' + d.new_spec + ')' : ''),
      result: 'Done',
      remarks: 'Changed by: ' + (d.changed_by || '') + (d.bd_ref ? ' | BD: ' + d.bd_ref : '')
    })

    return NextResponse.json({ success: true, msg: 'Part change recorded!' })
  }

  // Delete part
  if (d.type === 'delete_part') {
    const { error } = await supabase.from('mould_parts').delete().eq('id', d.part_id)
    if (error) return NextResponse.json({ success: false, msg: error.message })
    return NextResponse.json({ success: true, msg: 'Part removed!' })
  }

  return NextResponse.json({ success: false, msg: 'Unknown type' })
}
