-- ═══════════════════════════════════════════════════════
-- MAYUR OPERATIONS SYSTEM — Supabase Schema
-- ═══════════════════════════════════════════════════════

-- 1. USERS TABLE
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  username text unique not null,
  password text not null,
  full_name text,
  role text,
  plant text,
  modules text,
  status text default 'Active',
  created_at timestamptz default now()
);

-- 2. IMS STOCK TABLE
create table if not exists ims_stock (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  plant text,
  item_name text not null,
  category text,
  stock_cartons numeric default 0,
  unpack_cartons numeric default 0,
  unpack_lid numeric default 0,
  min_cartons numeric default 0,
  status text,
  entered_by text,
  created_at timestamptz default now()
);

-- 3. PRODUCTION TABLE
create table if not exists production (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  shift text,
  plant text,
  machine text,
  operator text,
  operator2 text,
  product text,
  mould text,
  cavities numeric,
  cycle_time numeric,
  material text,
  good_parts numeric default 0,
  rejection numeric default 0,
  downtime numeric default 0,
  shots_this_shift numeric default 0,
  machine_status text default 'running',
  stop_reason text,
  remarks text,
  entered_by text,
  created_at timestamptz default now()
);

-- 4. PRODUCTION SLOTS TABLE
create table if not exists production_slots (
  id uuid default gen_random_uuid() primary key,
  production_id uuid references production(id),
  slot_name text,
  good_parts numeric default 0,
  rejection numeric default 0,
  downtime numeric default 0,
  remarks text
);

-- 5. QUALITY CHECK TABLE
create table if not exists quality_checks (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  shift text,
  machine text,
  part_name text,
  qc_person text,
  no_short_shots text,
  no_flash text,
  no_burn_marks text,
  no_flow_marks text,
  no_sink_marks text,
  uniform_color text,
  no_contamination text,
  wall_thickness text,
  height text,
  diameter text,
  lid_fit text,
  stack_ability text,
  drop_test text,
  weight_check text,
  overall_result text,
  remarks text,
  created_at timestamptz default now()
);

-- 6. REJECTION TABLE
create table if not exists rejections (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  shift text,
  plant text,
  machine text,
  product text,
  rejection_qty numeric,
  reason text,
  action_taken text,
  notes text,
  entered_by text,
  created_at timestamptz default now()
);

-- 7. DISPATCH TABLE
create table if not exists dispatch_orders (
  id uuid default gen_random_uuid() primary key,
  order_id text unique,
  challan_no text,
  date date not null,
  customer text,
  vehicle_type text,
  vehicle_no text,
  driver_name text,
  delivery_address text,
  total_cartons numeric default 0,
  notes text,
  dispatch_by text,
  created_at timestamptz default now()
);

create table if not exists dispatch_lines (
  id uuid default gen_random_uuid() primary key,
  order_id text references dispatch_orders(order_id),
  line_no integer,
  plant text,
  item_name text,
  qty numeric,
  category text
);

-- 8. BREAKDOWN TABLE
create table if not exists breakdowns (
  id uuid default gen_random_uuid() primary key,
  bd_id text unique,
  date date not null,
  shift text,
  plant text,
  machine text,
  operator_name text,
  problem text,
  category text,
  mould_running text,
  time_of_call text,
  reporting_time text,
  analysis text,
  action_taken text,
  spares_used text,
  resolved_by text,
  work_finish_time text,
  downtime_min numeric default 0,
  estimated_min numeric default 0,
  status text default 'Pending',
  remarks text,
  reported_by text,
  created_at timestamptz default now()
);

-- 9. MOULD PM TABLE
create table if not exists mould_master (
  id uuid default gen_random_uuid() primary key,
  mould_code text,
  mould_name text not null,
  plant text,
  machine text,
  pm_frequency_shots numeric default 0,
  current_shots numeric default 0,
  next_pm_at_shots numeric default 0,
  status text default 'Active',
  last_updated timestamptz default now()
);

create table if not exists pm_logs (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  mould_name text,
  plant text,
  done_by text,
  current_shots numeric,
  next_pm_shots numeric,
  pm_frequency numeric,
  overall_result text,
  ng_count integer default 0,
  correction text,
  checks jsonb,
  created_at timestamptz default now()
);

-- 10. MOULD CHANGE TABLE
create table if not exists mould_changes (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  shift text,
  plant text,
  machine text,
  old_mould text,
  new_mould text,
  operator text,
  helper text,
  spray_done text,
  estimated_time numeric,
  actual_time numeric,
  mould_load_time text,
  mould_run_time text,
  on_time text,
  remarks text,
  entered_by text,
  created_at timestamptz default now()
);

-- 11. SPARES TABLE
create table if not exists spares_master (
  id uuid default gen_random_uuid() primary key,
  part_name text unique not null,
  category text,
  unit text default 'Pcs',
  min_qty numeric default 0,
  current_stock numeric default 0,
  status text default 'OK',
  last_price numeric,
  last_vendor text,
  last_updated timestamptz default now()
);

create table if not exists spare_movements (
  id uuid default gen_random_uuid() primary key,
  date date not null,
  slip_no text,
  vendor text,
  part_name text,
  category text,
  action text,
  qty numeric,
  price_per_pc numeric,
  total_price numeric,
  machine text,
  plant text,
  done_by text,
  new_stock numeric,
  created_at timestamptz default now()
);

-- 12. PARTY MASTER TABLE
create table if not exists party_master (
  id uuid default gen_random_uuid() primary key,
  party_name text not null,
  city text,
  contact_person text,
  phone text,
  status text default 'Active',
  created_at timestamptz default now()
);

-- 13. BENCHMARK TABLE
create table if not exists benchmarks (
  id uuid default gen_random_uuid() primary key,
  category text,
  avg_time numeric,
  best_time numeric,
  count integer default 0,
  last_updated timestamptz default now()
);

-- Insert default admin user
insert into users (username, password, full_name, role, plant, modules, status)
values ('nitin', 'nitin123', 'Nitin Nagpal', 'Admin', 'All', 
  'mis,ims,production,planning,quality,rejection,mouldchange,dispatch,batch,sales,spares,mouldpm,breakdown,users,performance',
  'Active')
on conflict (username) do nothing;

-- Row Level Security (disable for now - enable later)
alter table users enable row level security;
alter table ims_stock enable row level security;
alter table production enable row level security;
alter table breakdowns enable row level security;

-- Allow all for anon (we handle auth ourselves)
create policy "Allow all" on users for all using (true);
create policy "Allow all" on ims_stock for all using (true);
create policy "Allow all" on production for all using (true);
create policy "Allow all" on production_slots for all using (true);
create policy "Allow all" on quality_checks for all using (true);
create policy "Allow all" on rejections for all using (true);
create policy "Allow all" on dispatch_orders for all using (true);
create policy "Allow all" on dispatch_lines for all using (true);
create policy "Allow all" on breakdowns for all using (true);
create policy "Allow all" on mould_master for all using (true);
create policy "Allow all" on pm_logs for all using (true);
create policy "Allow all" on mould_changes for all using (true);
create policy "Allow all" on spares_master for all using (true);
create policy "Allow all" on spare_movements for all using (true);
create policy "Allow all" on party_master for all using (true);
create policy "Allow all" on benchmarks for all using (true);

