import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: CORS });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '7');
  const targetDate = searchParams.get('date');
  const fromDate = searchParams.get('from'); // calendar month start e.g. 2026-08-01
  const toDate = searchParams.get('to');     // calendar month end e.g. 2026-07-31

  const since = targetDate ? targetDate
    : fromDate ? fromDate
    : new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
  const until = targetDate ? targetDate : toDate ? toDate : undefined;

  // Total machines per day (all machines including breakdown)
  const { data: machineData } = await supabase
    .from('production')
    .select('date, plant, machine')
    .gte('date', since);

  // Build machine count per date
  const machineCounts: Record<string, Set<string>> = {};
  for (const row of machineData || []) {
    if (!machineCounts[row.date]) machineCounts[row.date] = new Set();
    if (row.machine && row.plant) machineCounts[row.date].add(row.plant+"_"+row.machine);
  }

  // Use combined view (box + lid machine hours)
  let query = supabase
    .from('daily_throughput_combined')
    .select('date,plant,machine,product,good_parts,box_mh,lid_mh,total_mh,throughput_per_carton,cartons,t_per_hour,actual_zone,floor_price,happy_price,list_price,daana_cost,tonnage')
    .gte('date', since)
    .not('t_per_hour', 'is', null)
    .gt('total_mh', 0)
    .order('date', { ascending: false });
  
  // If specific date, filter to only that date
  if (until) query = query.lte('date', until);
  
  const { data, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });

  // Aggregate by date
  const byDate: Record<string, any> = {};
  for (const row of data || []) {
    if (!byDate[row.date]) {
      byDate[row.date] = {
        date: row.date,
        total_mh: 0,
        box_mh: 0,
        lid_mh: 0,
        total_throughput: 0,
        items: [],
      };
    }
    byDate[row.date].total_mh   += row.total_mh || 0;
    byDate[row.date].box_mh     += row.box_mh || 0;
    byDate[row.date].lid_mh     += row.lid_mh || 0;
    byDate[row.date].total_throughput += (row.throughput_per_carton || 0) * (row.cartons || 0);
    byDate[row.date].items.push({
      product:    row.product,
      plant:      row.plant,
      good_parts: row.good_parts,
      box_mh:     row.box_mh,
      lid_mh:     row.lid_mh,
      total_mh:   row.total_mh,
      t_hr:       row.t_per_hour,
      zone:       row.actual_zone,
      floor:      row.floor_price,
      happy:      row.happy_price,
      list_price: row.list_price,
      daana_cost: row.daana_cost,
      tonnage:    row.tonnage,
    });
  }

  const N1 = 1097, N2 = 1615, N3 = 1938;
  const daily = Object.values(byDate).map((d: any) => {
    const avg_t_hr = d.total_mh > 0 ? Math.round(d.total_throughput / d.total_mh) : 0;
    const zone = avg_t_hr < N1 ? 'RED' : avg_t_hr < N2 ? 'N1' : avg_t_hr < N3 ? 'N2' : 'N3';
    return {
      ...d,
      avg_t_hr,
      zone,
      total_mh:        Math.round(d.total_mh * 10) / 10,
      box_mh:          Math.round(d.box_mh * 10) / 10,
      lid_mh:          Math.round(d.lid_mh * 10) / 10,
      total_throughput: Math.round(d.total_throughput),
      machine_count: machineCounts[d.date] ? machineCounts[d.date].size : 0,
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json(
    { daily, updated_at: new Date().toISOString() },
    { headers: CORS }
  );
}
