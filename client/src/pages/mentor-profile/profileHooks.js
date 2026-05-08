import { useState, useEffect, useMemo, useCallback } from 'react';
import { getMentorById } from '../../api/mentors';
import { getReviewsForMentor } from '../../api/reviews';
import { getMyFavorites, toggleFavorite } from '../../api/favorites';
import {
  buildAvailabilityCalendar,
  getSlotsForDate,
  normalizeAvailabilitySchedule,
  localDateStr,
} from '../../utils/mentorAvailability';
import { useAuth } from '../../context/useAuth';

export const EASE = [0.16, 1, 0.3, 1];

export function useProfileReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
      : false
  );
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const onChange = (e) => setReduced(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}
export const DUR_SHORT = 0.18;
export const DUR_MED = 0.28;
export const DUR_LONG = 0.45;
export const STAGGER = 0.07;

export function useMentor(id) {
  const [mentor, setMentor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(null);

  const fetch = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const { data, error } = await getMentorById(id);
    if (error || !data?.mentor) {
      setIsError(error?.message ?? 'Could not load mentor.');
      setMentor(null);
    } else {
      setMentor(data.mentor);
      setIsError(null);
    }
    setIsLoading(false);
  }, [id]);

  useEffect(() => { fetch(); }, [fetch]);

  return { mentor, isLoading, isError, refetch: fetch };
}

export function useMentorReviews(mentorId, { topic = null, sort = 'relevant', page = 1, pageSize = 6 } = {}) {
  const [allReviews, setAllReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!mentorId) return;
    setIsLoading(true);
    getReviewsForMentor(mentorId).then(({ data }) => {
      setAllReviews(data ?? []);
      setIsLoading(false);
    });
  }, [mentorId]);

  const topics = useMemo(() => {
    const counts = {};
    allReviews.forEach((r) => {
      const t = r.topic;
      if (t) counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .map(([slug, count]) => ({
        slug,
        label: slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        count,
      }));
  }, [allReviews]);

  const filtered = useMemo(() => {
    let list = topic ? allReviews.filter((r) => r.topic === topic) : [...allReviews];
    if (sort === 'recent') list = list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    else if (sort === 'rating') list = list.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
    return list;
  }, [allReviews, topic, sort]);

  const total = filtered.length;
  const reviews = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  return { reviews, total, topics, isLoading, allTotal: allReviews.length };
}

export function useFavoriteMentor(mentorId) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    if (!user || !mentorId) return;
    getMyFavorites().then(({ data }) => {
      if (data) {
        const id = String(mentorId).toLowerCase();
        setIsFavorited(data.some((fid) => String(fid).toLowerCase() === id));
      }
    });
  }, [user, mentorId]);

  const toggle = useCallback(async () => {
    if (!user) return;
    setIsFavorited((prev) => !prev);
    const { data, error } = await toggleFavorite(mentorId);
    if (error) { setIsFavorited((prev) => !prev); }
    else if (data) { setIsFavorited(data.favorited); }
  }, [user, mentorId]);

  return { isFavorited, toggle };
}

export function useShareLink() {
  const [copied, setCopied] = useState(false);
  const share = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }).catch(() => {});
  }, []);
  return { share, copied };
}

export function useNextAvailableSlots(mentor, count = 4) {
  return useMemo(() => {
    if (!mentor?.availability_schedule || mentor.available === false) return [];
    const norm = normalizeAvailabilitySchedule(mentor.availability_schedule);
    const hasSlots = Object.values(norm.weekly).some((a) => Array.isArray(a) && a.length > 0);
    if (!hasSlots) return [];

    const calendar = buildAvailabilityCalendar(norm, true, 14);
    const now = new Date();
    const slots = [];

    for (const { date, status } of calendar) {
      if (status === 'booked') continue;
      const daySlots = getSlotsForDate(norm, date, true);
      for (const { time, available } of daySlots) {
        if (!available) continue;
        const [h, m] = time.split(':').map(Number);
        const slotDate = new Date(date);
        slotDate.setHours(h, m, 0, 0);
        if (slotDate <= now) continue;
        slots.push({ date: new Date(slotDate), time, id: `${localDateStr(date)}-${time}` });
        if (slots.length >= count) return slots;
      }
    }
    return slots;
  }, [mentor]);
}

export function normalizeMentor(raw, reviews = []) {
  if (!raw) return null;

  const careerHistory = Array.isArray(raw.work_experience)
    ? raw.work_experience
        .sort((a, b) => (b.start_year ?? 0) - (a.start_year ?? 0))
        .map((j) => ({
          startYear: j.start_year,
          endYear: j.end_year ?? null,
          role: j.title ?? '',
          company: j.company ?? '',
          note: j.description ?? null,
        }))
    : [];

  const companies = [...new Set(careerHistory.map((j) => j.company).filter(Boolean))];

  const featuredReview = (() => {
    const candidates = reviews.filter((r) => r.comment?.trim()?.length > 30);
    if (!candidates.length) return null;
    const top = [...candidates].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0))[0];
    return {
      quote: top.comment.trim(),
      reviewerName: top.reviewer_name ?? 'Anonymous',
      reviewerRole: top.reviewer_role ?? '',
      reviewerIndustry: top.reviewer_industry ?? '',
      reviewerAvatarUrl: top.reviewer_avatar_url ?? null,
      rating: Number(top.rating) || 5,
      metric: top.metric ?? null,
    };
  })();

  return {
    ...raw,
    avatarUrl: raw.image_url ?? null,
    firstName: (raw.name ?? '').split(/\s+/)[0] ?? '',
    roleLabel: raw.title ?? '',
    industries: raw.industry ? [raw.industry] : [],
    stageLabel: null,
    yearsExperience: raw.years_experience ?? null,
    languages: [],
    isVerified: raw.tier === 'elite',
    joinedAt: raw.created_at ?? null,
    avgResponseHours: null,
    tagline: null,
    outcomes: [],
    sessionPreview: null,
    careerHistory,
    companies,
    ipoCount: null,
    acquiredCount: null,
    teamsLed: null,
    earlierCompanyHighlight: null,
    featuredReview,
    comparableMentors: [],
    rebookRate: null,
    recentBookings: (raw.total_sessions ?? 0),
    reviewCount: reviews.length,
    rating: (() => {
      if (reviews.length > 0) {
        return reviews.reduce((s, r) => s + (Number(r.rating) || 0), 0) / reviews.length;
      }
      return Number(raw.rating) || 0;
    })(),
    totalSessions: raw.total_sessions ?? 0,
    rate: raw.session_rate ?? null,
    timezone: raw.availability_schedule?.timezone ?? null,
  };
}

export function formatSlotRelative(slotDate) {
  const now = new Date();
  const diffMs = slotDate - now;
  const diffH = diffMs / 3600000;
  const diffD = Math.floor(diffMs / 86400000);

  if (diffH < 24) {
    const h = Math.floor(diffH);
    return h < 1 ? 'soon' : `in ${h} hour${h !== 1 ? 's' : ''}`;
  }
  if (diffD === 1) return 'tomorrow';
  if (diffD < 7) {
    return slotDate.toLocaleDateString(undefined, { weekday: 'long' });
  }
  return slotDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export function formatSlotTime(date, time) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date(date);
  d.setHours(h, m, 0, 0);
  const wd = d.toLocaleDateString(undefined, { weekday: 'short' });
  const t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  return { weekday: wd, time: t };
}

export function formatJoinedDate(iso) {
  if (!iso) return null;
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } catch { return null; }
}

export function formatRelativeReview(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffD = Math.floor((now - d) / 86400000);
    if (diffD < 30) return `${diffD || 1} days ago`;
    const diffM = Math.floor(diffD / 30);
    if (diffM < 12) return `${diffM} month${diffM !== 1 ? 's' : ''} ago`;
    return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  } catch { return ''; }
}
