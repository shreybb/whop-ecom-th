-- Atomic webhook idempotency claims.
-- Concurrent inserts of the same webhook-id cannot both succeed.
create table if not exists public.webhook_deliveries (
  id text primary key,
  created_at timestamptz not null default now()
);

alter table public.webhook_deliveries enable row level security;
-- Service-role key bypasses RLS. No anon/authenticated policies on purpose.
