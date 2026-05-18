-- Blog posts: admin-published + mentor-contributed articles.
-- RLS: public reads published posts; authors manage own drafts; admins manage all.

create table if not exists public.blog_posts (
  id               uuid        primary key default gen_random_uuid(),
  title            text        not null,
  slug             text        not null unique,
  category         text        not null default 'Career',
  excerpt          text        not null default '',
  body             text        not null default '',
  author_id        uuid        references auth.users(id) on delete set null,
  author_name      text        not null default '',
  author_role      text        not null default 'admin',
  status           text        not null default 'draft',
  rejection_reason text,
  published_at     timestamptz,
  read_time        text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

-- One SELECT policy: public sees published; authors see own; admins see all.
drop policy if exists blog_public_read on public.blog_posts;
create policy blog_public_read
  on public.blog_posts for select
  using (
    status = 'published'
    or author_id = auth.uid()
    or public.is_bridge_admin()
  );

drop policy if exists blog_author_insert on public.blog_posts;
create policy blog_author_insert
  on public.blog_posts for insert
  with check (author_id = auth.uid());

drop policy if exists blog_author_update on public.blog_posts;
create policy blog_author_update
  on public.blog_posts for update
  using (
    (author_id = auth.uid() and status in ('draft', 'pending', 'rejected'))
    or public.is_bridge_admin()
  )
  with check (
    (author_id = auth.uid() and status in ('draft', 'pending'))
    or public.is_bridge_admin()
  );

drop policy if exists blog_author_delete on public.blog_posts;
create policy blog_author_delete
  on public.blog_posts for delete
  using (
    (author_id = auth.uid() and status = 'draft')
    or public.is_bridge_admin()
  );

-- Auto-update updated_at on every row change.
create or replace function public.blog_posts_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute function public.blog_posts_set_updated_at();

-- Seed existing static posts (idempotent).
insert into public.blog_posts (title, slug, category, excerpt, body, author_name, author_role, status, published_at, read_time) values
(
  'How to Find the Right Mentor',
  'how-to-find-the-right-mentor',
  'Career',
  'A practical guide to identifying mentors who will actually move the needle on your career.',
  'Finding a mentor is less about prestige and more about fit. The best mentors aren''t the most famous — they''re the ones who''ve walked your exact next step.

Start by writing down the specific transition you''re trying to make. "Get promoted" is too vague. "Go from senior IC to staff engineer at a Series B" is actionable. Now search for people who made that exact move in the last three years.

When you reach out, skip the flattery. Lead with what you''re trying to figure out and why you think they specifically can help. Keep it to five sentences. Book one session. See if it works. Don''t commit to a six-month program with someone you''ve never met.

The best mentor relationships are built session by session, not signed up for.',
  'Sarah Chen', 'admin', 'published', '2026-04-15 00:00:00+00', '6 min'
),
(
  'The Science of Skill Transfer',
  'science-of-skill-transfer',
  'Craft',
  'What neuroscience tells us about how expertise actually passes from one person to another.',
  'Expertise doesn''t transfer through lectures. It transfers through apprenticeship — a fact neuroscience has confirmed repeatedly over the last two decades.

When an expert explains their reasoning out loud while working through a real problem, the learner''s brain activates patterns that reading about the same work can''t produce. This is why a single 45-minute session watching someone debug your actual code teaches more than a 10-hour course.

The implication for careers is clear: optimize for apprenticeship-style learning. Book sessions where the mentor is reacting to your specific situation, not delivering a prepared lecture.',
  'Dr. Marcus Webb', 'admin', 'published', '2026-04-08 00:00:00+00', '8 min'
),
(
  'Pricing Your Expertise as a Mentor',
  'pricing-your-expertise-as-a-mentor',
  'Mentors',
  'How top mentors on our platform think about value, pricing, and positioning.',
  'The mentors earning the most on Bridge aren''t the ones charging the least. They''re the ones charging enough to filter for serious mentees.

We analyzed booking data across 2,400 mentors. The sweet spot for most is $80–$150 per session — high enough to signal expertise, low enough to be accessible. Below $40, mentors report more no-shows and less prepared mentees. Above $200, booking velocity drops sharply unless the mentor has a strong external profile.

Start in the middle of your market. Raise rates 15% every time you hit 80% booked.',
  'Elena Voss', 'admin', 'published', '2026-03-30 00:00:00+00', '5 min'
),
(
  'From Junior to Senior in 18 Months',
  'from-junior-to-senior-18-months',
  'Stories',
  'A case study in accelerated career growth through structured mentorship.',
  'Eighteen months ago I was a junior engineer stuck in tickets. Today I lead a team of four. Here''s what changed.

I stopped reading career advice on Twitter and started booking monthly sessions with a staff engineer who''d made the same jump. First session, she told me which of my work was promotion-bait and which was just busywork. I''d been doing mostly busywork.

The specifics of what she said aren''t the point. The point is that one person who''d been there could diagnose my situation in 30 minutes in a way no amount of self-reflection had.',
  'Jordan E.', 'admin', 'published', '2026-03-22 00:00:00+00', '7 min'
),
(
  'Why We Built Single-Session Bookings',
  'why-we-built-single-session-bookings',
  'Product',
  'The thinking behind our core product decision: one session at a time.',
  'Every other mentorship platform sells packages. We sell single sessions. Here''s why.

Commitment is the enemy of trying. When people have to buy a 3-month package to meet a mentor, most don''t. When they can book 45 minutes for $60, they do. And once they''ve had one good session, they book again — on their terms.

Packages serve the platform''s revenue model. Single sessions serve the user''s actual need.',
  'Sarah Chen', 'admin', 'published', '2026-03-10 00:00:00+00', '4 min'
),
(
  'The Real Cost of Cold DMs',
  'the-real-cost-of-cold-dms',
  'Career',
  'Why "just reach out on LinkedIn" is terrible advice, and what actually works.',
  'The average cold LinkedIn DM to a senior professional gets a 4% response rate. We know because we measured it.

Here''s what happens when a busy executive opens a cold outreach message: they scan for three things in under five seconds. Who are you, what do you want, and why should they care. Most DMs fail all three tests simultaneously.

The fix isn''t a better template. The fix is a platform where the ask is pre-negotiated and the mentor has already opted in.',
  'Priya Sharma', 'admin', 'published', '2026-02-28 00:00:00+00', '9 min'
)
on conflict (slug) do nothing;
