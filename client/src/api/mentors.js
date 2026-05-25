import supabase from "./supabase";

export async function getMentorById(mentorProfileId) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("id", mentorProfileId)
    .single();
  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  const { data: menteeCount } = await supabase.rpc('get_distinct_mentee_count', {
    mentor_profile_id: mentorProfileId,
  });

  return {
    data: {
      mentor: data,
      reviews: {
        count: data.total_sessions ?? 0,
        average: data.rating ?? null,
      },
      menteesHelped: menteeCount ?? 0,
    },
    error: null,
  };
}

export async function getAllMentors({
  search = '',
  industry = '',
  tier = '',
  category = '',
  subcategory = '',
  availableOnly = false,
  rateMin = '',
  rateMax = '',
  sortBy = 'rating',
  page = 0,
  pageSize = 12,
  includeUnverified = false,
} = {}) {
  const sortColumn = sortBy === 'experience' ? 'years_experience' : sortBy === 'sessions' ? 'total_sessions' : 'rating';

  let query = supabase
    .from("mentor_profiles")
    .select("*", { count: "exact" })
    .or('onboarding_complete.is.null,onboarding_complete.eq.true')
    .or('mentor_status.is.null,mentor_status.eq.active');

  if (search) {
    query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,company.ilike.%${search}%`);
  }
  if (industry) {
    query = query.eq("industry", industry);
  }
  if (tier) {
    query = query.eq("tier", tier);
  }
  if (category) {
    query = query.contains('mentorship_categories', [category]);
  }
  if (subcategory) {
    query = query.contains('mentorship_subcategories', [subcategory]);
  }
  if (availableOnly) {
    query = query.eq("available", true);
  }
  if (rateMin !== '') {
    query = query.gte("session_rate", Number(rateMin));
  }
  if (rateMax !== '') {
    query = query.lte("session_rate", Number(rateMax));
  }

  query = query
    .order(sortColumn, { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;
  if (error) return { data: null, error, totalCount: 0 };
  return { data: data ?? [], error: null, totalCount: count ?? 0 };
}

export async function getFeaturedMentors() {
  const { data, error } = await supabase.from('mentor_profiles').select('*')
    .eq('is_featured', true)
    .or('mentor_status.is.null,mentor_status.eq.active')
    .or('onboarding_complete.is.null,onboarding_complete.eq.true')
    .order('rating', { ascending: false })
    .limit(3);
  if (error) throw error;
  return data || [];
}
