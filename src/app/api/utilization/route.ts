// src/app/api/utilization/route.ts
// MOS API — Raw machine utilization (NOT from view — direct from production table)

import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get("days") || "30");
  const since = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

  // Raw MH per day — directly from production table (no view, no cap)
  const { data: daily, error: e1 } = await supabase.rpc("get_daily_utilization", {
    since_date: since
  });

  if (e1) {
    // Fallback: direct query
    const { data: raw, error: e2 } = await supabase
      .from("production")
      .select("date, machine, plant, product, good_parts, cycle_time, cavities")
      .gte("date", since)
      .gt("cycle_time", 0)
      .gt("cavities", 0)
      .order("date", { ascending: false });

    if (e2) return Response.json({ error: e2.message }, { status: 500 });

    // Process in JS
    const byDate: Record<string, any> = {};
    for (const row of raw || []) {
      const d = row.date;
      if (!byDate[d]) byDate[d] = { date: d, machines: new Set(), raw_mh: 0 };
      byDate[d].machines.add(row.machine);
      byDate[d].raw_mh += row.good_parts / ((3600 / row.cycle_time) * row.cavities);
    }

    const TARGET = 345; // 15 machines × 23h
    const result = Object.values(byDate).map((d: any) => ({
      date: d.date,
      machine_count: d.machines.size,
      raw_mh: Math.round(d.raw_mh * 10) / 10,
      target_mh: TARGET,
      util_pct: Math.round(d.raw_mh / TARGET * 100 * 10) / 10,
    })).sort((a: any, b: any) => b.date.localeCompare(a.date));

    // Weekly summary
    const byWeek: Record<string, any> = {};
    for (const d of result) {
      const week = new Date(d.date);
      week.setDate(week.getDate() - week.getDay() + 1); // Monday
      const wk = week.toISOString().slice(0, 10);
      if (!byWeek[wk]) byWeek[wk] = { week: wk, days: 0, total_mh: 0 };
      byWeek[wk].days++;
      byWeek[wk].total_mh += d.raw_mh;
    }
    const weekly = Object.values(byWeek).map((w: any) => ({
      ...w,
      avg_mh: Math.round(w.total_mh / w.days * 10) / 10,
      util_pct: Math.round(w.total_mh / (TARGET * w.days) * 100 * 10) / 10,
    })).sort((a: any, b: any) => b.week.localeCompare(a.week));

    const total_mh = result.reduce((a: number, d: any) => a + d.raw_mh, 0);
    const avg_util = result.length ? Math.round(total_mh / (TARGET * result.length) * 100 * 10) / 10 : 0;

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

  return Response.json({ daily });
}
