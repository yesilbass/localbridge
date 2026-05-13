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

export async function getAllMentors({ search = '', industry = '', tier = '', availableOnly = false, rateMin = '', rateMax = '', sortBy = 'rating', page = 0, pageSize = 12, includeUnverified = false } = {}) {
  const sortColumn = sortBy === 'experience' ? 'years_experience' : sortBy === 'sessions' ? 'total_sessions' : 'rating';

  let query = supabase
    .from("mentor_profiles")
    .select("*", { count: "exact" })
    // Seeded/demo mentors have onboarding_complete = NULL — keep them visible.
    // Hide only mentors who started real onboarding but didn't finish (false).
    .or('onboarding_complete.is.null,onboarding_complete.eq.true');

  // Hide unverified mentors by default. Backfilled rows from the existing
  // catalog were promoted to 'verified' in the migration, so this never hides
  // legitimate seed mentors. Bronze-tier (verification_score < 40) are also
  // hidden by default — they only appear with ?include_unverified=1.
  if (!includeUnverified) {
    query = query
      .or('verification_status.is.null,verification_status.eq.verified')
      .or('verification_tier.is.null,verification_tier.neq.bronze');
  }

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

export async function getFeaturedMentors({ includeUnverified = false } = {}) {
  let query = supabase.from('mentor_profiles').select('*');
  if (!includeUnverified) {
    query = query
      .or('verification_status.is.null,verification_status.eq.verified')
      .or('verification_tier.is.null,verification_tier.neq.bronze');
  }
  const { data, error } = await query
    .order('verification_tier', { ascending: false }) // platinum/gold first
    .order('rating', { ascending: false })
    .limit(6);
  if (error) throw error;
  return data || [];
}
