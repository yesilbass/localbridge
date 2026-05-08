import { getMenteeProfile, upsertMenteeProfile } from './menteeProfile';
import { callAIProxy } from './ai';

export async function getAIMatchedMentors({ menteeProfile, mentors, resumeText }) {
  const parsed = await callAIProxy('mentor_match', { menteeProfile, mentors, resumeText });

  if (!Array.isArray(parsed.top_matches) || parsed.top_matches.length !== 3) {
    throw new Error('Bridge AI returned malformed top_matches (expected exactly 3).');
  }
  if (!Array.isArray(parsed.honorable_mentions) || parsed.honorable_mentions.length !== 2) {
    throw new Error('Bridge AI returned malformed honorable_mentions (expected exactly 2).');
  }

  return parsed;
}

export async function saveMenteeAssessment(userId, profileData) {
  return upsertMenteeProfile(userId, profileData);
}

export async function loadMenteeAssessment(userId) {
  return getMenteeProfile(userId);
}
