-- Review system enhancements:
--   1. Unique constraint: one review per mentee per session
--   2. Auto-trigger: keeps mentor_profiles.rating in sync after review changes
-- Safe to re-run (uses IF NOT EXISTS / OR REPLACE / DROP IF EXISTS).

-- ── 1. Unique review per session/reviewer ────────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'reviews_session_reviewer_unique'
      AND conrelid = 'public.reviews'::regclass
  ) THEN
    ALTER TABLE public.reviews
      ADD CONSTRAINT reviews_session_reviewer_unique
      UNIQUE (session_id, reviewer_id);
  END IF;
END $$;

-- ── 2. Rating aggregation function ───────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.update_mentor_rating()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_mentor_id uuid;
BEGIN
  -- For DELETE use OLD; for INSERT/UPDATE use NEW.
  IF TG_OP = 'DELETE' THEN
    target_mentor_id := OLD.mentor_id;
  ELSE
    target_mentor_id := NEW.mentor_id;
  END IF;

  UPDATE public.mentor_profiles
  SET rating = COALESCE(
    (
      SELECT ROUND(AVG(r.rating)::numeric, 2)
      FROM public.reviews r
      WHERE r.mentor_id = target_mentor_id
    ),
    0
  )
  WHERE id = target_mentor_id;

  -- AFTER trigger on each row; return value is ignored for AFTER triggers.
  RETURN NULL;
END;
$$;

-- ── 3. Attach trigger to reviews table ───────────────────────────────────────
DROP TRIGGER IF EXISTS trg_update_mentor_rating ON public.reviews;

CREATE TRIGGER trg_update_mentor_rating
  AFTER INSERT OR UPDATE OF rating OR DELETE
  ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_mentor_rating();
