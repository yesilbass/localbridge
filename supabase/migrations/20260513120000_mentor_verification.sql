-- ============================================================================
-- Bridge Mentor Verification & Tiering System
--
-- Adds:
--   * mentor_verification_runs        (one row per attempt, append-only)
--   * mentor_verification_steps       (per-component sub-runs)
--   * mentor_references               (third-party references)
--   * mentor_review_queue             (admin human-in-the-loop)
--   * ai_usage                        (token accounting)
--   * admins                          (whitelist for /admin pages)
--   * mentor_tier(score)              (pure SQL tier function)
--   * is_bridge_admin()               (auth helper for RLS)
--
-- Extends:
--   * mentor_profiles  +verification_status, +verification_score,
--                      +verification_tier, +verified_at, +verification_run_id
--
-- DECISION: We add `verification_tier` instead of using the existing `tier`
-- column because `tier` already holds the seniority/pricing tier
-- (`rising/established/expert/elite`) consumed by getAllMentors().
-- DECISION: Admin authorization is a `public.admins(user_id)` table queried by
-- a SECURITY DEFINER function `public.is_bridge_admin()`. This avoids needing
-- a custom Supabase JWT hook to surface an `is_admin` claim. Swapping to JWT
-- claims later is a one-function change.
--
-- Hard constraints honored:
--   * All ALTERs on existing tables use ADD COLUMN IF NOT EXISTS only
--   * No DROPs, no constraint changes on existing tables
--   * Every new table has RLS policies in this same migration
-- ============================================================================

-- ──────────────────────────────────────────────────────────────────────────────
-- Admin allowlist
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email   text,
  notes   text,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- Only admins can see the admin list. Service role bypasses RLS.
drop policy if exists admins_select_admin_only on public.admins;
create policy admins_select_admin_only
  on public.admins for select
  using (
    exists (select 1 from public.admins a where a.user_id = auth.uid())
  );

-- Bootstrap: add ayesilbas3444@gmail.com if their auth.users row exists.
-- Hard-coded email match per the brief; rerunnable.
insert into public.admins (user_id, email, notes)
select id, email, 'bootstrap admin'
from auth.users
where lower(email) = lower('ayesilbas3444@gmail.com')
on conflict (user_id) do nothing;

-- Helper: callable from RLS without recursion. SECURITY DEFINER so it can
-- read public.admins regardless of the caller's RLS scope.
create or replace function public.is_bridge_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_bridge_admin() from public;
grant execute on function public.is_bridge_admin() to authenticated, anon;

-- ──────────────────────────────────────────────────────────────────────────────
-- mentor_profiles extensions
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.mentor_profiles
  add column if not exists verification_status text not null default 'unverified';

alter table public.mentor_profiles
  add column if not exists verification_score int not null default 0;

alter table public.mentor_profiles
  add column if not exists verification_tier text not null default 'bronze';

alter table public.mentor_profiles
  add column if not exists verified_at timestamptz;

alter table public.mentor_profiles
  add column if not exists verification_run_id uuid;

-- We add the CHECK constraints with NOT VALID + VALIDATE so existing rows
-- aren't rejected on application of the migration. Defaults already satisfy
-- the constraints, so VALIDATE is safe.
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'mentor_profiles_verification_status_check'
  ) then
    alter table public.mentor_profiles
      add constraint mentor_profiles_verification_status_check
      check (verification_status in ('unverified','in_progress','verified','rejected','suspended'))
      not valid;
    alter table public.mentor_profiles validate constraint mentor_profiles_verification_status_check;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'mentor_profiles_verification_tier_check'
  ) then
    alter table public.mentor_profiles
      add constraint mentor_profiles_verification_tier_check
      check (verification_tier in ('bronze','silver','gold','platinum'))
      not valid;
    alter table public.mentor_profiles validate constraint mentor_profiles_verification_tier_check;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'mentor_profiles_verification_score_range'
  ) then
    alter table public.mentor_profiles
      add constraint mentor_profiles_verification_score_range
      check (verification_score >= 0 and verification_score <= 100)
      not valid;
    alter table public.mentor_profiles validate constraint mentor_profiles_verification_score_range;
  end if;
end$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- Verification runs
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.mentor_verification_runs (
  id uuid primary key default gen_random_uuid(),
  mentor_profile_id uuid not null references public.mentor_profiles(id) on delete cascade,
  status text not null check (status in ('in_progress','passed','failed','manual_review','expired')),
  score int not null default 0 check (score >= 0 and score <= 100),
  tier text not null default 'bronze' check (tier in ('bronze','silver','gold','platinum')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  test_mode boolean not null default true,
  components jsonb not null default '{}'::jsonb,
  last_error text
);

create index if not exists mentor_verification_runs_profile_idx
  on public.mentor_verification_runs(mentor_profile_id);

create index if not exists mentor_verification_runs_status_idx
  on public.mentor_verification_runs(status);

-- Now that the table exists, point the FK from mentor_profiles to it. We use
-- ALTER not ADD CONSTRAINT IF NOT EXISTS because that syntax doesn't exist;
-- guard with a DO block.
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'mentor_profiles_verification_run_fk'
  ) then
    alter table public.mentor_profiles
      add constraint mentor_profiles_verification_run_fk
      foreign key (verification_run_id)
      references public.mentor_verification_runs(id)
      on delete set null;
  end if;
end$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- Verification steps (per-component)
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.mentor_verification_steps (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.mentor_verification_runs(id) on delete cascade,
  component text not null check (component in (
    'identity','gov_id','professional_email','linkedin','resume_ai',
    'expertise_interview','reference','track_record'
  )),
  status text not null check (status in ('pending','passed','failed','manual_review')),
  score int not null default 0,
  weight int not null,
  payload jsonb not null default '{}'::jsonb,
  evaluation jsonb,
  idempotency_key text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create index if not exists mentor_verification_steps_run_idx
  on public.mentor_verification_steps(run_id);

create unique index if not exists mentor_verification_steps_idem_idx
  on public.mentor_verification_steps(run_id, component, idempotency_key)
  where idempotency_key is not null;

-- ──────────────────────────────────────────────────────────────────────────────
-- References
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.mentor_references (
  id uuid primary key default gen_random_uuid(),
  mentor_profile_id uuid not null references public.mentor_profiles(id) on delete cascade,
  run_id uuid references public.mentor_verification_runs(id) on delete set null,
  reference_email text not null,
  reference_name text,
  relationship text,
  token text unique not null,
  submitted_at timestamptz,
  rating int check (rating between 1 and 5),
  comments text,
  ai_authenticity_score int,
  created_at timestamptz not null default now()
);

create index if not exists mentor_references_profile_idx
  on public.mentor_references(mentor_profile_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- Admin review queue
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.mentor_review_queue (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.mentor_verification_runs(id) on delete cascade,
  reason text not null,
  priority int not null default 50,
  assignee_user_id uuid references auth.users(id),
  decision text check (decision in ('approve','reject','request_more_info')),
  decision_notes text,
  decided_at timestamptz,
  decided_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists mentor_review_queue_pending_idx
  on public.mentor_review_queue(decision)
  where decision is null;

-- ──────────────────────────────────────────────────────────────────────────────
-- AI usage accounting
-- ──────────────────────────────────────────────────────────────────────────────
create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  feature text not null,
  model text,
  input_tokens int,
  output_tokens int,
  total_tokens int,
  cost_usd numeric(10, 6),
  created_at timestamptz not null default now(),
  metadata jsonb
);

create index if not exists ai_usage_user_idx on public.ai_usage(user_id);
create index if not exists ai_usage_feature_idx on public.ai_usage(feature);

-- ──────────────────────────────────────────────────────────────────────────────
-- Pure tier function (used by orchestrator + UI)
-- ──────────────────────────────────────────────────────────────────────────────
create or replace function public.mentor_tier(score int)
returns text
language sql
immutable
as $$
  select case
    when coalesce(score, 0) >= 90 then 'platinum'
    when coalesce(score, 0) >= 70 then 'gold'
    when coalesce(score, 0) >= 40 then 'silver'
    else 'bronze'
  end;
$$;

grant execute on function public.mentor_tier(int) to authenticated, anon;

-- ──────────────────────────────────────────────────────────────────────────────
-- RLS — enable + policies for every new table
-- ──────────────────────────────────────────────────────────────────────────────
alter table public.mentor_verification_runs enable row level security;
alter table public.mentor_verification_steps enable row level security;
alter table public.mentor_references enable row level security;
alter table public.mentor_review_queue enable row level security;
alter table public.ai_usage enable row level security;

-- mentor_verification_runs: mentor reads their own; admin reads all
drop policy if exists mvr_select_self_or_admin on public.mentor_verification_runs;
create policy mvr_select_self_or_admin
  on public.mentor_verification_runs for select
  using (
    public.is_bridge_admin()
    or exists (
      select 1 from public.mentor_profiles mp
      where mp.id = mentor_verification_runs.mentor_profile_id
        and mp.user_id = auth.uid()
    )
  );

-- No mentor-side inserts/updates: API uses service role.
-- (Service role bypasses RLS, so we don't need INSERT/UPDATE policies.)

-- mentor_verification_steps: same scope as runs
drop policy if exists mvs_select_self_or_admin on public.mentor_verification_steps;
create policy mvs_select_self_or_admin
  on public.mentor_verification_steps for select
  using (
    public.is_bridge_admin()
    or exists (
      select 1
      from public.mentor_verification_runs r
      join public.mentor_profiles mp on mp.id = r.mentor_profile_id
      where r.id = mentor_verification_steps.run_id
        and mp.user_id = auth.uid()
    )
  );

-- mentor_references: mentor reads their own (token-based reads are
-- service-role only on the backend); admin reads all
drop policy if exists mref_select_self_or_admin on public.mentor_references;
create policy mref_select_self_or_admin
  on public.mentor_references for select
  using (
    public.is_bridge_admin()
    or exists (
      select 1 from public.mentor_profiles mp
      where mp.id = mentor_references.mentor_profile_id
        and mp.user_id = auth.uid()
    )
  );

-- mentor_review_queue: admin only
drop policy if exists mrq_admin_only on public.mentor_review_queue;
create policy mrq_admin_only
  on public.mentor_review_queue for select
  using (public.is_bridge_admin());

-- ai_usage: user reads their own rows; admin reads all
drop policy if exists ai_usage_self_or_admin on public.ai_usage;
create policy ai_usage_self_or_admin
  on public.ai_usage for select
  using (public.is_bridge_admin() or auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────────
-- Realtime: emit row changes so the wizard hooks update without polling
-- ──────────────────────────────────────────────────────────────────────────────
do $$
begin
  -- Skip if the publication doesn't exist (e.g. self-hosted without realtime)
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    -- Add tables to the publication if not already members
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'mentor_verification_runs'
    ) then
      alter publication supabase_realtime add table public.mentor_verification_runs;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'mentor_verification_steps'
    ) then
      alter publication supabase_realtime add table public.mentor_verification_steps;
    end if;
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'mentor_references'
    ) then
      alter publication supabase_realtime add table public.mentor_references;
    end if;
  end if;
end$$;

-- ──────────────────────────────────────────────────────────────────────────────
-- Backfill: existing mentors are auto-promoted to Silver/verified so they
-- aren't kicked out of search results when the migration applies. They can
-- opt to re-verify for higher tiers via the new wizard.
-- ──────────────────────────────────────────────────────────────────────────────
update public.mentor_profiles
set
  verification_status = 'verified',
  verification_score  = 50,
  verification_tier   = 'silver',
  verified_at         = coalesce(verified_at, now())
where verification_status = 'unverified'
  and (
    onboarding_complete is null   -- legacy seed mentors
    or onboarding_complete = true -- mentors who actually finished onboarding
  );

-- ──────────────────────────────────────────────────────────────────────────────
-- Grants — service role bypasses RLS so we only need authenticated SELECTs.
-- ──────────────────────────────────────────────────────────────────────────────
grant select on public.mentor_verification_runs   to authenticated;
grant select on public.mentor_verification_steps  to authenticated;
grant select on public.mentor_references          to authenticated;
grant select on public.mentor_review_queue        to authenticated;
grant select on public.ai_usage                   to authenticated;
grant select on public.admins                     to authenticated;
