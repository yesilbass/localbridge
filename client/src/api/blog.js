import supabase from './supabase';

export const BLOG_CATEGORIES = ['Career', 'Craft', 'Mentors', 'Stories', 'Product'];

export function slugify(title) {
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function calcReadTime(body) {
  const words = (body || '').trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min`;
}

export function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function getPublishedPosts(category) {
  let q = supabase
    .from('blog_posts')
    .select('id, title, slug, category, excerpt, author_name, author_role, published_at, read_time')
    .eq('status', 'published')
    .order('published_at', { ascending: false });
  if (category && category !== 'All') q = q.eq('category', category);
  const { data, error } = await q;
  if (error) throw error;
  return data || [];
}

export async function getPostBySlug(slug) {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMyPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertDraft(post) {
  const payload = { ...post };
  if (!payload.id) delete payload.id;
  const { data, error } = await supabase
    .from('blog_posts')
    .upsert(payload, { onConflict: 'id' })
    .select('id, slug')
    .single();
  if (error) throw error;
  return data;
}

export async function submitForReview(postId) {
  const { error } = await supabase
    .from('blog_posts')
    .update({ status: 'pending' })
    .eq('id', postId);
  if (error) throw error;
}

export async function deleteDraft(postId) {
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', postId);
  if (error) throw error;
}

// Admin-only — blocked by RLS for non-admins.
export async function getAdminPosts(status = 'pending') {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('status', status)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function publishPost(postId) {
  const { error } = await supabase
    .from('blog_posts')
    .update({ status: 'published', published_at: new Date().toISOString(), rejection_reason: null })
    .eq('id', postId);
  if (error) throw error;
}

export async function rejectPost(postId, reason) {
  const { error } = await supabase
    .from('blog_posts')
    .update({ status: 'rejected', rejection_reason: reason || null })
    .eq('id', postId);
  if (error) throw error;
}
