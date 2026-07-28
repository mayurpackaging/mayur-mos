import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// CORS headers — allow CRM to fetch
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

  const { data: summary, error } = await supabase
    .from('daily_throughput')
    .select('date, plant, product, good_parts, machine_hours_used, throughput_per_carton, cartons, t_per_hour, actual_zone, floor_price, happy_price')
    .gte('date', new Date(Date.now() - days * 86400000).toISOString().slice(0, 10))
    .not('t_per_hour', 'is', null)
    .gt('machine_hours_used', 0)
    .order('date', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500, headers: CORS });

  // Aggregate by date
  const byDate: Record<string, any> = {};
  for (const row of summary || []) {
    if (!byDate[row.date]) {
      byDate[row.date] = { date: row.date, total_mh: 0, total_throughput: 0, items: [] };
    }
    byDate[row.date].total_mh += row.machine_hours_used || 0;
    byDate[row.date].total_throughput += (row.throughput_per_carton || 0) * (row.cartons || 0);
    byDate[row.date].items.push({
      product: row.product,
      plant: row.plant,
      good_parts: row.good_parts,
      mh: row.machine_hours_used,
      t_hr: row.t_per_hour,
      zone: row.actual_zone,
      floor: row.floor_price,
      happy: row.happy_price,
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
      total_mh: Math.round(d.total_mh * 10) / 10,
      total_throughput: Math.round(d.total_throughput)
    };
  }).sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json(
    { daily, updated_at: new Date().toISOString() },
    { headers: CORS }
  );
}
