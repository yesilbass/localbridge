import supabase from './supabase';

async function getOwnMentorProfileId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from('mentor_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  return data?.id ?? null;
}

export async function getMentorPosts({ category, subcategory, mentor_id, limit = 20, offset = 0 } = {}) {
  let query = supabase
    .from('mentor_posts')
    .select(`
      *,
      mentor_profiles (
        id, name, image_url, title, company, rating, total_sessions
      )
    `)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) query = query.eq('category_id', category);
  if (subcategory) query = query.eq('subcategory_id', subcategory);
  if (mentor_id) query = query.eq('mentor_id', mentor_id);

  const { data, error } = await query;
  if (error) return { data: [], error };
  return { data: data ?? [], error: null };
}

export async function createMentorPost({ title, body, category_id, subcategory_id }) {
  const mentorId = await getOwnMentorProfileId();
  if (!mentorId) return { data: null, error: new Error('Not a mentor') };

  const { data, error } = await supabase
    .from('mentor_posts')
    .insert({
      mentor_id: mentorId,
      title: title.trim(),
      body: body.trim(),
      category_id: category_id || null,
      subcategory_id: subcategory_id || null,
    })
    .select('*')
    .single();

  return { data, error };
}

export async function deleteMentorPost(postId) {
  const { error } = await supabase.from('mentor_posts').delete().eq('id', postId);
  return { error };
}

export async function toggleUpvote(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated'), upvotes: 0, upvoted: false };

  const { data: existing } = await supabase
    .from('mentor_post_upvotes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from('mentor_post_upvotes').delete().eq('id', existing.id);
  } else {
    await supabase.from('mentor_post_upvotes').insert({ post_id: postId, user_id: user.id });
  }

  const { data: post } = await supabase.from('mentor_posts').select('upvotes').eq('id', postId).single();
  return {
    upvotes: post?.upvotes ?? 0,
    upvoted: !existing?.id,
    error: null,
  };
}

export async function getUserUpvotedPostIds(postIds) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !postIds.length) return new Set();

  const { data } = await supabase
    .from('mentor_post_upvotes')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds);

  return new Set((data ?? []).map((r) => r.post_id));
}
