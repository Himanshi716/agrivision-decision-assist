
-- Scans table: one row per produce analysis
create table public.scans (
  id uuid primary key default gen_random_uuid(),
  device_id text not null,
  item_type text not null,
  verdict text not null check (verdict in ('Best Pick','Use Soon','Avoid')),
  score numeric(3,1) not null check (score >= 0 and score <= 10),
  confidence integer not null check (confidence >= 0 and confidence <= 100),
  reason text not null,
  recommendation text not null,
  ripeness_stage text not null,
  traits jsonb not null default '[]'::jsonb,
  has_image boolean not null default false,
  created_at timestamptz not null default now()
);

create index scans_device_created_idx on public.scans (device_id, created_at desc);

alter table public.scans enable row level security;

-- Anonymous app: anyone can read/insert their own device-scoped rows.
create policy "scans_select_public"
  on public.scans for select
  using (true);

create policy "scans_insert_public"
  on public.scans for insert
  with check (device_id is not null and length(device_id) between 8 and 128);

-- Feedback table
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans(id) on delete cascade,
  device_id text not null,
  helpful boolean not null,
  note text,
  created_at timestamptz not null default now()
);

create index feedback_scan_idx on public.feedback (scan_id);

alter table public.feedback enable row level security;

create policy "feedback_select_public"
  on public.feedback for select
  using (true);

create policy "feedback_insert_public"
  on public.feedback for insert
  with check (device_id is not null and length(device_id) between 8 and 128);
