import supabase from './supabase';

export const MENTOR_AVATARS_BUCKET = 'mentor-avatars';

export async function uploadMentorAvatar(userId, file, onProgress) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${ext}`;

  onProgress?.(10);
  const { error } = await supabase.storage.from(MENTOR_AVATARS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
  });
  if (error) throw error;

  onProgress?.(80);
  const { data } = supabase.storage.from(MENTOR_AVATARS_BUCKET).getPublicUrl(path);
  onProgress?.(100);
  return data.publicUrl;
}
