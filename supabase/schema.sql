-- ─── Etheran — Supabase Schema ──────────────────────────────────────────────

-- providers
create table if not exists providers (
  address text primary key,
  jobs_completed int not null default 0,
  jobs_rejected int not null default 0,
  jobs_expired int not null default 0,
  total_volume numeric(36, 18) not null default 0,
  first_seen timestamptz,
  last_active timestamptz,
  reputation_score numeric generated always as (
    (
      jobs_completed::numeric
      / nullif(jobs_completed + jobs_rejected + jobs_expired, 0)
      * 60
    )
  ) stored
);

comment on table providers is 'ERC-8183 provider addresses with aggregated job stats';
comment on column providers.reputation_score is 'Partial score: completion component only. Full score computed in /api/reputation/[address].';

-- evaluators
create table if not exists evaluators (
  address text primary key,
  evaluations_completed int not null default 0,
  evaluations_rejected int not null default 0,
  avg_response_time_hours numeric,
  first_seen timestamptz,
  last_active timestamptz
);

comment on table evaluators is 'ERC-8183 evaluator addresses with aggregated evaluation stats';

-- jobs
create table if not exists jobs (
  id text primary key,
  client text not null,
  provider text not null,
  evaluator text not null,
  value numeric(36, 18) not null default 0,
  spec_hash text not null,
  deliverable_hash text,
  status text not null check (status in ('open','funded','submitted','completed','rejected','expired')),
  created_at timestamptz not null,
  funded_at timestamptz,
  submitted_at timestamptz,
  resolved_at timestamptz,
  expires_at timestamptz not null,
  tx_hash text not null,
  block_number bigint not null
);

comment on table jobs is 'ERC-8183 job records indexed from on-chain events';

-- Indexes
create index if not exists jobs_status_idx on jobs(status);
create index if not exists jobs_provider_idx on jobs(provider);
create index if not exists jobs_evaluator_idx on jobs(evaluator);
create index if not exists jobs_client_idx on jobs(client);
create index if not exists jobs_created_at_idx on jobs(created_at desc);
create index if not exists jobs_provider_status_idx on jobs(provider, status);

-- Enable RLS (read-only for anon)
alter table providers enable row level security;
alter table evaluators enable row level security;
alter table jobs enable row level security;

-- Public read access (no auth required)
create policy if not exists "public read providers"
  on providers for select using (true);

create policy if not exists "public read evaluators"
  on evaluators for select using (true);

create policy if not exists "public read jobs"
  on jobs for select using (true);
