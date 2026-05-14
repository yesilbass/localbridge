-- work_experience was never in a migration but is written by MentorOnboarding
ALTER TABLE mentor_profiles
  ADD COLUMN IF NOT EXISTS work_experience JSONB DEFAULT '[]';

-- verification_data: gov ID number, file names, LinkedIn URL, motivation essay
ALTER TABLE mentor_profiles
  ADD COLUMN IF NOT EXISTS verification_data JSONB DEFAULT NULL;

-- Algorithmic score columns on the queue
ALTER TABLE mentor_applications_queue
  ADD COLUMN IF NOT EXISTS verification_score INTEGER DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS verification_breakdown JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS auto_decision TEXT DEFAULT NULL;
