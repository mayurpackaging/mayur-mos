// src/app/api/utilization/route.ts
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const fromDate = searchParams.get("from");
  const since = fromDate
    ? fromDate
    : new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

  const { data: raw, error } = await supabase
    .from("production")
    .select("date, machine, good_parts, cycle_time, cavities")
    .gte("date", since)
    .gt("cycle_time", 0)
    .gt("cavities", 0)
    .order("date", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const TARGET = 345;
  const byDate: Record<string, { raw_mh: number; machines: string[] }> = {};

  for (const row of raw || []) {
    const d = String(row.date);
    if (!byDate[d]) byDate[d] = { raw_mh: 0, machines: [] };
    byDate[d].raw_mh += row.good_parts / ((3600 / row.cycle_time) * row.cavities);
    if (!byDate[d].machines.includes(row.machine)) {
      byDate[d].machines.push(row.machine);
    }
  }

  const result = Object.entries(byDate)
    .map(([date, d]) => ({
      date,
      machine_count: d.machines.length,
      raw_mh: Math.round(d.raw_mh * 10) / 10,
      util_pct: Math.round((d.raw_mh / TARGET) * 1000) / 10,
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  const byWeek: Record<string, { week: string; days: number; total_mh: number }> = {};
  for (const d of result) {
    const dt = new Date(d.date);
    dt.setDate(dt.getDate() - dt.getDay() + 1);
    const wk = dt.toISOString().slice(0, 10);
    if (!byWeek[wk]) byWeek[wk] = { week: wk, days: 0, total_mh: 0 };
    byWeek[wk].days++;
    byWeek[wk].total_mh += d.raw_mh;
  }

  const weekly = Object.values(byWeek)
    .map((w) => ({
      ...w,
      avg_mh: Math.round((w.total_mh / w.days) * 10) / 10,
      util_pct: Math.round((w.total_mh / (TARGET * w.days)) * 1000) / 10,
    }))
    .sort((a, b) => b.week.localeCompare(a.week));

  const total_mh = result.reduce((a, d) => a + d.raw_mh, 0);
  const avg_util = result.length
    ? Math.round((total_mh / (TARGET * result.length)) * 1000) / 10
    : 0;

  return Response.json({
    daily: result,
    weekly,
    summary: {
      total_mh: Math.round(total_mh),
      avg_mh_per_day: Math.round(total_mh / (result.length || 1)),
      avg_util_pct: avg_util,
      days: result.length,
      target_mh_per_day: TARGET,
    },
    updated_at: new Date().toISOString(),
  });
}
