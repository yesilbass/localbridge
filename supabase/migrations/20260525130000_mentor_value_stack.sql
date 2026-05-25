-- Mentor value stack: featured flag, why_i_mentor, badges, posts, session follow-ups.

-- Featured spotlight (admin-only toggle)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mentor_profiles' AND column_name = 'featured'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'mentor_profiles' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.mentor_profiles RENAME COLUMN featured TO is_featured;
  END IF;
END $$;

ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false;

ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS why_i_mentor text;

-- Session follow-ups (mentor_notes is mentor-only at query level — omit from mentee selects)
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS mentor_notes text,
  ADD COLUMN IF NOT EXISTS action_items jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS session_goals jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.sessions.mentor_notes IS
  'Private mentor notes. Mentee client queries must omit this column.';

-- Distinct mentees helped
CREATE OR REPLACE FUNCTION public.get_distinct_mentee_count(mentor_profile_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT mentee_id)::integer
  FROM public.sessions
  WHERE mentor_id = mentor_profile_id AND status = 'completed';
$$;

-- Badge table
CREATE TABLE IF NOT EXISTS public.mentor_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  badge_type text NOT NULL,
  awarded_at timestamptz DEFAULT now(),
  UNIQUE(mentor_id, badge_type)
);

ALTER TABLE public.mentor_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_badges_public_read" ON public.mentor_badges;
CREATE POLICY "mentor_badges_public_read" ON public.mentor_badges
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "mentor_badges_service_write" ON public.mentor_badges;
CREATE POLICY "mentor_badges_service_write" ON public.mentor_badges
  FOR ALL USING (auth.role() = 'service_role');

-- Session-count badges (count completed sessions directly)
CREATE OR REPLACE FUNCTION public.award_session_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total int;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    SELECT COUNT(*)::int INTO total
    FROM public.sessions
    WHERE mentor_id = NEW.mentor_id AND status = 'completed';

    IF total >= 1 THEN
      INSERT INTO public.mentor_badges (mentor_id, badge_type) VALUES (NEW.mentor_id, 'first_session') ON CONFLICT DO NOTHING;
    END IF;
    IF total >= 10 THEN
      INSERT INTO public.mentor_badges (mentor_id, badge_type) VALUES (NEW.mentor_id, 'sessions_10') ON CONFLICT DO NOTHING;
    END IF;
    IF total >= 25 THEN
      INSERT INTO public.mentor_badges (mentor_id, badge_type) VALUES (NEW.mentor_id, 'sessions_25') ON CONFLICT DO NOTHING;
    END IF;
    IF total >= 50 THEN
      INSERT INTO public.mentor_badges (mentor_id, badge_type) VALUES (NEW.mentor_id, 'sessions_50') ON CONFLICT DO NOTHING;
    END IF;
    IF total >= 100 THEN
      INSERT INTO public.mentor_badges (mentor_id, badge_type) VALUES (NEW.mentor_id, 'sessions_100') ON CONFLICT DO NOTHING;
    END IF;

    UPDATE public.mentor_profiles
    SET total_sessions = total
    WHERE id = NEW.mentor_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_award_session_badges ON public.sessions;
CREATE TRIGGER trigger_award_session_badges
  AFTER UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.award_session_badges();

-- Top rated badge after review changes
CREATE OR REPLACE FUNCTION public.award_top_rated_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_mentor_id uuid;
  avg_rating numeric;
  review_count int;
BEGIN
  IF TG_OP = 'DELETE' THEN
    target_mentor_id := OLD.mentor_id;
  ELSE
    target_mentor_id := NEW.mentor_id;
  END IF;

  SELECT ROUND(AVG(r.rating)::numeric, 2), COUNT(*)::int
  INTO avg_rating, review_count
  FROM public.reviews r
  WHERE r.mentor_id = target_mentor_id;

  IF review_count >= 10 AND avg_rating >= 4.8 THEN
    INSERT INTO public.mentor_badges (mentor_id, badge_type)
    VALUES (target_mentor_id, 'top_rated')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_award_top_rated_badge ON public.reviews;
CREATE TRIGGER trigger_award_top_rated_badge
  AFTER INSERT OR UPDATE OF rating OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.award_top_rated_badge();

-- Multi-discipline badge when 3+ pillar categories tagged
CREATE OR REPLACE FUNCTION public.award_multi_category_badge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF jsonb_array_length(COALESCE(NEW.mentorship_categories, '[]'::jsonb)) >= 3 THEN
    INSERT INTO public.mentor_badges (mentor_id, badge_type)
    VALUES (NEW.id, 'multi_category')
    ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_award_multi_category_badge ON public.mentor_profiles;
CREATE TRIGGER trigger_award_multi_category_badge
  AFTER UPDATE OF mentorship_categories ON public.mentor_profiles
  FOR EACH ROW EXECUTE FUNCTION public.award_multi_category_badge();

-- Mentor posts
CREATE TABLE IF NOT EXISTS public.mentor_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id uuid REFERENCES public.mentor_profiles(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  body text NOT NULL,
  category_id text,
  subcategory_id text,
  upvotes int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.mentor_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_posts_public_read" ON public.mentor_posts;
CREATE POLICY "mentor_posts_public_read" ON public.mentor_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "mentor_posts_mentor_insert" ON public.mentor_posts;
CREATE POLICY "mentor_posts_mentor_insert" ON public.mentor_posts FOR INSERT WITH CHECK (
  mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "mentor_posts_mentor_update" ON public.mentor_posts;
CREATE POLICY "mentor_posts_mentor_update" ON public.mentor_posts FOR UPDATE USING (
  mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "mentor_posts_mentor_delete" ON public.mentor_posts;
CREATE POLICY "mentor_posts_mentor_delete" ON public.mentor_posts FOR DELETE USING (
  mentor_id IN (SELECT id FROM public.mentor_profiles WHERE user_id = auth.uid())
);

CREATE TABLE IF NOT EXISTS public.mentor_post_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES public.mentor_posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

ALTER TABLE public.mentor_post_upvotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_post_upvotes_read" ON public.mentor_post_upvotes;
CREATE POLICY "mentor_post_upvotes_read" ON public.mentor_post_upvotes FOR SELECT USING (true);

DROP POLICY IF EXISTS "mentor_post_upvotes_insert" ON public.mentor_post_upvotes;
CREATE POLICY "mentor_post_upvotes_insert" ON public.mentor_post_upvotes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "mentor_post_upvotes_delete" ON public.mentor_post_upvotes;
CREATE POLICY "mentor_post_upvotes_delete" ON public.mentor_post_upvotes FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.sync_mentor_post_upvotes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.mentor_posts SET upvotes = upvotes + 1 WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.mentor_posts SET upvotes = GREATEST(0, upvotes - 1) WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trigger_sync_mentor_post_upvotes ON public.mentor_post_upvotes;
CREATE TRIGGER trigger_sync_mentor_post_upvotes
  AFTER INSERT OR DELETE ON public.mentor_post_upvotes
  FOR EACH ROW EXECUTE FUNCTION public.sync_mentor_post_upvotes();
