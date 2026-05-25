-- Mentorship category expansion: free-text description + AI-derived tags.
-- mentorship_categories and mentorship_subcategories are written ONLY by the
-- service role (tag-mentor-categories API). Never by authenticated client.

ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS mentorship_description text;

ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS mentorship_categories jsonb DEFAULT '[]'::jsonb;

ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS mentorship_subcategories jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.mentor_profiles.mentorship_description IS
  'Mentor-written free text. Public read. Updated by mentor via client.';

COMMENT ON COLUMN public.mentor_profiles.mentorship_categories IS
  'AI-derived pillar IDs. Service role write only (tag-mentor-categories).';

COMMENT ON COLUMN public.mentor_profiles.mentorship_subcategories IS
  'AI-derived subcategory IDs. Service role write only (tag-mentor-categories).';

CREATE INDEX IF NOT EXISTS idx_mentor_description_fts
  ON public.mentor_profiles USING gin(to_tsvector('english', coalesce(mentorship_description, '')));

CREATE INDEX IF NOT EXISTS idx_mentor_categories
  ON public.mentor_profiles USING gin(mentorship_categories);

CREATE INDEX IF NOT EXISTS idx_mentor_subcategories
  ON public.mentor_profiles USING gin(mentorship_subcategories);
