import supabase from "./supabase";

export async function getMentorById(mentorProfileId) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("id", mentorProfileId)
    .single();
  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  return {
    data: {
      mentor: data,
      reviews: {
        count: data.total_sessions ?? 0,
        average: data.rating ?? null,
      },
    },
    error: null,
  };
}

export async function getAllMentors({ search = '', industry = '', tier = '', availableOnly = false, rateMin = '', rateMax = '', sortBy = 'rating', page = 0, pageSize = 12 } = {}) {
  const sortColumn = sortBy === 'experience' ? 'years_experience' : sortBy === 'sessions' ? 'total_sessions' : 'rating';

  let query = supabase
    .from("mentor_profiles")
    .select("*", { count: "exact" })
    // Seeded/demo mentors have onboarding_complete = NULL — keep them visible.
    // Hide only mentors who started real onboarding but didn't finish (false).
    .or('onboarding_complete.is.null,onboarding_complete.eq.true');

  if (search) {
    query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,company.ilike.%${search}%`);
  }
  if (industry) {
    query = query.eq("industry", industry);
  }
  if (tier) {
    query = query.eq("tier", tier);
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
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .limit(6);
  if (error) throw error;
  return data || [];
}
