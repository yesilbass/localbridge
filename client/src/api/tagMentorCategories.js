import supabase from './supabase';

export async function tagMentorCategories(mentorProfileId) {
  if (!mentorProfileId) return;

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) return;

  fetch('/api/ai-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action: 'mentor_tag', payload: { mentor_id: mentorProfileId } }),
  }).catch((err) => {
    console.error('[tagMentorCategories]', err);
  });
}
