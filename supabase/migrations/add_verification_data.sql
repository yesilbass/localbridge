-- ─────────────────────────────────────────────────────────────────────────────
-- Mentor application pipeline columns + queue table
-- Run this in Supabase SQL editor (safe to re-run — all IF NOT EXISTS)
-- ─────────────────────────────────────────────────────────────────────────────

-- mentor_profiles: application & Checkr columns
ALTER TABLE public.mentor_profiles
  ADD COLUMN IF NOT EXISTS mentor_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS checkr_candidate_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS checkr_report_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS checkr_status TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS application_submitted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS tier_dispute JSONB DEFAULT NULL;

-- mentor_applications_queue: admin review queue
CREATE TABLE IF NOT EXISTS public.mentor_applications_queue (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_profile_id     UUID NOT NULL REFERENCES public.mentor_profiles(id) ON DELETE CASCADE,
  checkr_report_id      TEXT DEFAULT NULL,
  checkr_result         TEXT DEFAULT NULL,
  decision              TEXT DEFAULT NULL,
  decision_notes        TEXT DEFAULT NULL,
  decided_at            TIMESTAMPTZ DEFAULT NULL,
  verification_score    INTEGER DEFAULT NULL,
  verification_breakdown JSONB DEFAULT NULL,
  auto_decision         TEXT DEFAULT NULL,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add columns that may be missing if the table was created from an earlier version
ALTER TABLE public.mentor_applications_queue
  ADD COLUMN IF NOT EXISTS verification_score    INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS verification_breakdown JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auto_decision         TEXT DEFAULT NULL;

CREATE INDEX IF NOT EXISTS maq_mentor_profile_idx
  ON public.mentor_applications_queue(mentor_profile_id);

CREATE INDEX IF NOT EXISTS maq_decision_idx
  ON public.mentor_applications_queue(decision)
  WHERE decision IS NULL;

-- Service role bypasses RLS — no policies needed for DevPortal routes.
-- Authenticated mentors can read their own queue row.
ALTER TABLE public.mentor_applications_queue ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'mentor_applications_queue' AND policyname = 'maq_read_own'
  ) THEN
    CREATE POLICY maq_read_own
      ON public.mentor_applications_queue FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.mentor_profiles mp
          WHERE mp.id = mentor_applications_queue.mentor_profile_id
            AND mp.user_id = auth.uid()
        )
      );
  END IF;
END$$;
