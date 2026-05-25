-- Mentor application onboarding progress (post-approval guided profile setup)
ALTER TABLE mentor_profiles
  ADD COLUMN IF NOT EXISTS onboarding_step int DEFAULT 0;

-- Supabase Storage: create 'mentor-avatars' bucket manually in Supabase dashboard → Storage → New bucket
-- Set to public. RLS: authenticated users can upload to {user_id}/* only.
-- Cannot be created via SQL migration — configure in dashboard.

COMMENT ON COLUMN mentor_profiles.onboarding_step IS
  'Post-approval onboarding wizard progress (0–5). Resumes at saved step.';
