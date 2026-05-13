-- Mentor's IANA timezone, captured at onboarding/availability save time.
-- Used to render "their local time" alongside the viewer's local time.
ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS timezone text;

COMMENT ON COLUMN public.mentor_profiles.timezone IS
  'IANA timezone identifier (e.g. America/New_York, Europe/Istanbul). Captured from the mentor''s browser.';
