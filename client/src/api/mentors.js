import supabase from "./supabase";

export async function getMentorById(mentorProfileId) {
  const { data, error } = await supabase
    .from("mentor_profiles")
    .select("*")
    .eq("id", mentorProfileId)
    .single();
  if (error) return { data: null, error };
  if (!data) return { data: null, error: null };

  const schedule = data.availability_schedule;
  const hasSchedule =
    schedule &&
    schedule.weekly &&
    Object.keys(schedule.weekly).length > 0;

  const mentor = hasSchedule
    ? data
    : {
        ...data,
        availability_schedule: {
          weekly: {
            "1": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
            "2": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
            "3": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
            "4": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
            "5": ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"],
          },
          timezone: "UTC",
        },
      };

  return {
    data: {
      mentor,
      reviews: {
        count: data.total_sessions ?? 0,
        average: data.rating ?? null,
      },
    },
    error: null,
  };
}

export async function getAllMentors({ search = '', industry = '', sortBy = 'rating', page = 0, pageSize = 12 } = {}) {
  const sortColumn = sortBy === 'experience' ? 'years_experience' : sortBy === 'sessions' ? 'total_sessions' : 'rating';

  let query = supabase
    .from("mentor_profiles")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,title.ilike.%${search}%,company.ilike.%${search}%`);
  }
  if (industry) {
    query = query.eq("industry", industry);
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
