-- Calendly migration: replace hand-rolled Google Calendar scheduling with
-- Calendly OAuth + event types + webhooks as the single source of truth.

-- mentor_profiles: drop legacy Google + weekly grid columns, add Calendly
alter table mentor_profiles
  drop column if exists calendar_connected,
  drop column if exists google_refresh_token,
  drop column if exists availability_schedule;

alter table mentor_profiles
  add column if not exists calendly_user_uri text,
  add column if not exists calendly_event_type_uri text,
  add column if not exists calendly_scheduling_url text,
  add column if not exists calendly_connected boolean not null default false;

-- bridge_sessions / sessions: capture Calendly invitee details + meeting URL
alter table sessions
  add column if not exists calendly_event_uri text,
  add column if not exists calendly_invitee_uri text,
  add column if not exists calendly_cancel_url text,
  add column if not exists calendly_reschedule_url text,
  add column if not exists join_url text,
  add column if not exists stripe_session_id text,
  add column if not exists calendly_scheduling_link text;

create unique index if not exists sessions_stripe_session_id_uniq
  on sessions (stripe_session_id) where stripe_session_id is not null;

create index if not exists sessions_calendly_invitee_uri_idx
  on sessions (calendly_invitee_uri) where calendly_invitee_uri is not null;

-- Tokens live in a dedicated table accessed via the service role only.
-- No RLS policies attached → all client reads are denied by default.
create table if not exists mentor_calendly_credentials (
  mentor_profile_id uuid primary key
    references mentor_profiles(id) on delete cascade,
  user_uri text not null,
  access_token text not null,
  refresh_token text not null,
  expires_at timestamptz not null,
  organization_uri text,
  webhook_subscription_uri text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table mentor_calendly_credentials enable row level security;

-- Idempotency table for webhook events (prevents double-processing)
create table if not exists calendly_webhook_events (
  event_id text primary key,
  received_at timestamptz not null default now()
);

alter table calendly_webhook_events enable row level security;
