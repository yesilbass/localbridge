import supabase from './supabase';

const COMMENTS_TABLE = 'community_comments';

function displayNameFromProfile(personalInfo, email) {
  const info = personalInfo ?? {};
  const first = info.firstName ?? info.first_name ?? '';
  const last = info.lastName ?? info.last_name ?? '';
  const combined = [first, last].filter(Boolean).join(' ').trim();
  if (combined) return combined;
  if (info.full_name) return String(info.full_name);
  if (email) return String(email).split('@')[0];
  return 'Member';
}

async function fetchAuthorMeta(authorIds) {
  if (!authorIds.length) {
    return { profileMap: new Map(), mentorMap: new Map() };
  }

  const [profilesRes, mentorsRes] = await Promise.all([
    supabase.from('user_profiles').select('user_id, personal_info').in('user_id', authorIds),
    supabase
      .from('mentor_profiles')
      .select('user_id, id, image_url')
      .eq('mentor_status', 'active')
      .in('user_id', authorIds),
  ]);

  const profileMap = new Map(
    (profilesRes.data ?? []).map((p) => [
      p.user_id,
      {
        name: displayNameFromProfile(p.personal_info, null),
        avatar: p.personal_info?.avatar_url ?? null,
      },
    ]),
  );

  const mentorMap = new Map(
    (mentorsRes.data ?? []).map((m) => [m.user_id, { mentor_profile_id: m.id, image_url: m.image_url }]),
  );

  for (const id of authorIds) {
    if (!profileMap.has(id)) {
      profileMap.set(id, { name: 'Member', avatar: null });
    }
  }

  return { profileMap, mentorMap };
}

function attachAuthors(posts, profileMap, mentorMap) {
  return posts.map((post) => {
    const profile = profileMap.get(post.author_id) ?? { name: 'Member', avatar: null };
    const mentor = mentorMap.get(post.author_id);
    return {
      ...post,
      author: {
        id: post.author_id,
        name: profile.name,
        avatar: profile.avatar ?? mentor?.image_url ?? null,
        is_mentor: Boolean(mentor),
        mentor_profile_id: mentor?.mentor_profile_id ?? null,
      },
    };
  });
}

export async function getCommunityPosts({
  category_id,
  post_type,
  sort = 'recent',
  limit = 20,
  offset = 0,
} = {}) {
  let query = supabase.from('community_posts').select('*', { count: 'exact' });

  if (category_id) query = query.eq('category_id', category_id);
  if (post_type) query = query.eq('post_type', post_type);

  query = sort === 'top'
    ? query.order('upvotes', { ascending: false }).order('created_at', { ascending: false })
    : query.order('created_at', { ascending: false });

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;
  if (error) return { data: [], error, totalCount: 0 };

  const authorIds = [...new Set((data ?? []).map((p) => p.author_id))];
  const { profileMap, mentorMap } = await fetchAuthorMeta(authorIds);
  return {
    data: attachAuthors(data ?? [], profileMap, mentorMap),
    error: null,
    totalCount: count ?? 0,
  };
}

export async function getCommunityPost(postId) {
  const { data, error } = await supabase.from('community_posts').select('*').eq('id', postId).maybeSingle();
  if (error || !data) return { data: null, error: error ?? new Error('Not found') };

  const { profileMap, mentorMap } = await fetchAuthorMeta([data.author_id]);
  return { data: attachAuthors([data], profileMap, mentorMap)[0], error: null };
}

export async function createCommunityPost({ category_id, post_type, title, body }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('community_posts')
    .insert({
      author_id: user.id,
      category_id,
      post_type,
      title: title.trim(),
      body: body.trim(),
    })
    .select('*')
    .single();

  if (error) return { data: null, error };

  const { profileMap, mentorMap } = await fetchAuthorMeta([user.id]);
  return { data: attachAuthors([data], profileMap, mentorMap)[0], error: null };
}

export async function deleteCommunityPost(postId) {
  const { error } = await supabase.from('community_posts').delete().eq('id', postId);
  return { error };
}

export async function togglePostUpvote(postId, userId) {
  const uid = userId ?? (await supabase.auth.getUser()).data.user?.id;
  if (!uid) return { error: new Error('Not authenticated'), upvoted: false, count: 0 };

  const { data: existing } = await supabase
    .from('community_post_upvotes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', uid)
    .maybeSingle();

  if (existing?.id) {
    await supabase.from('community_post_upvotes').delete().eq('id', existing.id);
  } else {
    await supabase.from('community_post_upvotes').insert({ post_id: postId, user_id: uid });
  }

  const { data: post } = await supabase.from('community_posts').select('upvotes').eq('id', postId).single();
  return { upvoted: !existing?.id, count: post?.upvotes ?? 0, error: null };
}

export async function getUserUpvotes(postIds) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !postIds?.length) return new Set();

  const { data } = await supabase
    .from('community_post_upvotes')
    .select('post_id')
    .eq('user_id', user.id)
    .in('post_id', postIds);

  return new Set((data ?? []).map((r) => r.post_id));
}

export async function getComments(postId) {
  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) return { data: [], error };

  const authorIds = [...new Set((data ?? []).map((c) => c.author_id))];
  const { profileMap, mentorMap } = await fetchAuthorMeta(authorIds);

  return {
    data: (data ?? []).map((c) => {
      const profile = profileMap.get(c.author_id) ?? { name: 'Member', avatar: null };
      const mentor = mentorMap.get(c.author_id);
      return {
        ...c,
        author: {
          id: c.author_id,
          name: profile.name,
          avatar: profile.avatar ?? mentor?.image_url ?? null,
          is_mentor: Boolean(mentor),
          mentor_profile_id: mentor?.mentor_profile_id ?? null,
        },
      };
    }),
    error: null,
  };
}

export async function createComment({ post_id, body }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from(COMMENTS_TABLE)
    .insert({ post_id, author_id: user.id, body: body.trim() })
    .select('*')
    .single();

  if (error) return { data: null, error };

  const { profileMap, mentorMap } = await fetchAuthorMeta([user.id]);
  const profile = profileMap.get(user.id) ?? { name: 'Member', avatar: null };
  const mentor = mentorMap.get(user.id);

  return {
    data: {
      ...data,
      author: {
        id: user.id,
        name: profile.name,
        avatar: profile.avatar ?? mentor?.image_url ?? null,
        is_mentor: Boolean(mentor),
        mentor_profile_id: mentor?.mentor_profile_id ?? null,
      },
    },
    error: null,
  };
}

export async function deleteComment(commentId) {
  const { error } = await supabase.from(COMMENTS_TABLE).delete().eq('id', commentId);
  return { error };
}

export async function getCategoryPostCounts() {
  const { data, error } = await supabase.from('community_posts').select('category_id');
  if (error) return { data: {}, error };

  const counts = {};
  for (const row of data ?? []) {
    counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }
  return { data: counts, error: null };
}

export async function getCategoryLastActivity() {
  const { data, error } = await supabase.from('community_posts').select('category_id, created_at');
  if (error) return { data: {}, error };

  const last = {};
  for (const row of data ?? []) {
    if (!last[row.category_id] || row.created_at > last[row.category_id]) {
      last[row.category_id] = row.created_at;
    }
  }
  return { data: last, error: null };
}

export async function getCategoryMemberCount(categoryId) {
  const { data, error } = await supabase
    .from('community_posts')
    .select('author_id')
    .eq('category_id', categoryId);

  if (error) return { count: 0, error };
  return { count: new Set((data ?? []).map((r) => r.author_id)).size, error: null };
}

/** @deprecated use getUserUpvotes */
export async function getUserUpvotedCommunityPostIds(postIds) {
  return getUserUpvotes(postIds);
}

/** @deprecated use getCategoryPostCounts + getCategoryLastActivity */
export async function getCommunityHubStats() {
  const [countsRes, lastRes] = await Promise.all([
    getCategoryPostCounts(),
    getCategoryLastActivity(),
  ]);
  const stats = {};
  for (const id of new Set([...Object.keys(countsRes.data ?? {}), ...Object.keys(lastRes.data ?? {})])) {
    stats[id] = {
      count: countsRes.data?.[id] ?? 0,
      lastActive: lastRes.data?.[id] ?? null,
    };
  }
  return { data: stats, error: countsRes.error ?? lastRes.error };
}

export async function getCommunityStructure() {
  const { data: sections, error: sErr } = await supabase
    .from('community_sections')
    .select('*')
    .order('position', { ascending: true });
  if (sErr) return { data: null, error: sErr };

  const { data: channels, error: cErr } = await supabase
    .from('community_channels')
    .select('*')
    .order('position', { ascending: true });
  if (cErr) return { data: null, error: cErr };

  const channelsBySection = {};
  for (const ch of channels ?? []) {
    if (!channelsBySection[ch.section_id]) channelsBySection[ch.section_id] = [];
    channelsBySection[ch.section_id].push(ch);
  }

  return {
    data: (sections ?? []).map((s) => ({ ...s, channels: channelsBySection[s.id] ?? [] })),
    error: null,
  };
}

export async function getChannelMessages(channelId, { limit = 50, before = null } = {}) {
  let query = supabase
    .from('community_messages')
    .select('*')
    .eq('channel_id', channelId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) query = query.lt('created_at', before);

  const { data, error } = await query;
  if (error) return { data: [], error };

  const authorIds = [...new Set((data ?? []).map((m) => m.author_id))];
  const { profileMap, mentorMap } = await fetchAuthorMeta(authorIds);

  return {
    data: (data ?? []).reverse().map((m) => {
      const profile = profileMap.get(m.author_id) ?? { name: 'Member', avatar: null };
      const mentor = mentorMap.get(m.author_id);
      return {
        ...m,
        author: {
          id: m.author_id,
          name: profile.name,
          avatar: profile.avatar ?? mentor?.image_url ?? null,
          is_mentor: Boolean(mentor),
          mentor_profile_id: mentor?.mentor_profile_id ?? null,
        },
      };
    }),
    error: null,
  };
}

export async function sendChannelMessage(channelId, body) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: new Error('Not authenticated') };

  const { data, error } = await supabase
    .from('community_messages')
    .insert({ channel_id: channelId, author_id: user.id, body: body.trim() })
    .select('*')
    .single();

  if (error) return { data: null, error };

  const { profileMap, mentorMap } = await fetchAuthorMeta([user.id]);
  const profile = profileMap.get(user.id) ?? { name: 'Member', avatar: null };
  const mentor = mentorMap.get(user.id);

  return {
    data: {
      ...data,
      author: {
        id: user.id,
        name: profile.name,
        avatar: profile.avatar ?? mentor?.image_url ?? null,
        is_mentor: Boolean(mentor),
        mentor_profile_id: mentor?.mentor_profile_id ?? null,
      },
    },
    error: null,
  };
}

export async function modAction(action, payload) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: 'Not authenticated' };

  const res = await fetch('/api/utils?action=community-mod', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, payload }),
  });

  const json = await res.json();
  return res.ok ? { success: true } : { error: json.error ?? 'Action failed' };
}

export async function checkIfBlocked() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from('community_blocked_users')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();
  return Boolean(data);
}
