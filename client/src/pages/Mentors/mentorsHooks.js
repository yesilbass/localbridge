import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getAllMentors } from '../../api/mentors';

export const MENTORS_PAGE_SIZE = 24;

const ROLE_SEARCH_MAP = {
  pm: 'product manager',
  em: 'engineering manager',
  designer: 'designer',
  ic: 'engineer',
  founder: 'founder',
  sales: 'sales',
  marketer: 'marketing',
};

const INDUSTRY_DB_MAP = {
  fintech: 'finance',
  ai: 'technology',
  'b2b-saas': 'technology',
  consumer: '',
  creator: '',
  climate: '',
  healthcare: 'healthcare',
  web3: 'technology',
};

const STAGE_TIER_MAP = {
  'pre-seed': 'rising',
  seed: 'rising',
  'series-ab': 'established',
  'series-c': 'expert',
  public: 'elite',
  faang: 'elite',
};

const RATE_MAP = {
  'under-100': { min: 0, max: 99 },
  '100-200': { min: 100, max: 200 },
  '200-400': { min: 200, max: 400 },
  'over-400': { min: 400, max: null },
};

const API_SORT_MAP = {
  relevant: 'rating',
  rating: 'rating',
  newest: 'sessions',
  'rate-asc': 'experience',
  'rate-desc': 'sessions',
};

export function useDebouncedValue(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debouncedValue;
}

export function useMentorDensity() {
  const [density, setDensityState] = useState(() => {
    try { return localStorage.getItem('bridge.mentors.density') || 'cards'; } catch { return 'cards'; }
  });
  const setDensity = useCallback((d) => {
    setDensityState(d);
    try { localStorage.setItem('bridge.mentors.density', d); } catch { /* ignore */ }
  }, []);
  return [density, setDensity];
}

export function useMentorFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = {
    q:         searchParams.get('q') || '',
    role:      searchParams.get('role')?.split(',').filter(Boolean) || [],
    industry:  searchParams.get('industry')?.split(',').filter(Boolean) || [],
    stage:     searchParams.get('stage')?.split(',').filter(Boolean) || [],
    rate:      searchParams.get('rate')?.split(',').filter(Boolean) || [],
    available: searchParams.get('available') === '1',
    sort:      searchParams.get('sort') || 'relevant',
    page:      parseInt(searchParams.get('page') || '1', 10),
  };

  const setFilter = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (Array.isArray(value)) {
        if (value.length) next.set(key, value.join(','));
        else next.delete(key);
      } else if (typeof value === 'boolean') {
        if (value) next.set(key, '1');
        else next.delete(key);
      } else if (value === '' || value == null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
      if (key !== 'page' && key !== 'sort' && key !== 'density') {
        next.delete('page');
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const clearAll = useCallback(() => {
    setSearchParams(prev => {
      const keep = new URLSearchParams();
      const density = prev.get('density');
      const sort = prev.get('sort');
      if (density) keep.set('density', density);
      if (sort) keep.set('sort', sort);
      return keep;
    }, { replace: true });
  }, [setSearchParams]);

  const activeCount =
    (filters.q ? 1 : 0) +
    filters.role.length +
    filters.industry.length +
    filters.stage.length +
    filters.rate.length +
    (filters.available ? 1 : 0);

  return { filters, setFilter, clearAll, activeCount };
}

export function useMentorQuery(filters, page) {
  const [state, setState] = useState({ mentors: [], total: 0, isLoading: true, isError: false });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey(k => k + 1), []);

  const filterKey = JSON.stringify({ ...filters, page });

  useEffect(() => {
    let cancelled = false;
    setState(prev => ({ ...prev, isLoading: true, isError: false }));

    const apiPage = (page || 1) - 1;

    let industry = '';
    if (filters.industry.length === 1) {
      industry = INDUSTRY_DB_MAP[filters.industry[0]] || '';
    }

    let tier = '';
    if (filters.stage.length === 1) {
      tier = STAGE_TIER_MAP[filters.stage[0]] || '';
    }

    let rateMin = '';
    let rateMax = '';
    if (filters.rate.length > 0) {
      const mins = filters.rate.map(r => RATE_MAP[r]?.min ?? 0);
      const maxes = filters.rate.map(r => RATE_MAP[r]?.max);
      rateMin = String(Math.min(...mins));
      const validMaxes = maxes.filter(m => m != null);
      rateMax = validMaxes.length > 0 ? String(Math.max(...validMaxes)) : '';
    }

    let search = filters.q;
    if (filters.role.length > 0) {
      const roleTerm = ROLE_SEARCH_MAP[filters.role[0]] || filters.role[0];
      search = search ? `${search} ${roleTerm}` : roleTerm;
    }

    const sortBy = API_SORT_MAP[filters.sort] || 'rating';

    getAllMentors({
      search,
      industry,
      tier,
      availableOnly: filters.available,
      rateMin,
      rateMax,
      sortBy,
      page: apiPage,
      pageSize: MENTORS_PAGE_SIZE,
    }).then(({ data, error, totalCount }) => {
      if (cancelled) return;
      if (error) {
        setState({ mentors: [], total: 0, isLoading: false, isError: true });
      } else {
        setState({ mentors: data ?? [], total: totalCount ?? 0, isLoading: false, isError: false });
      }
    }).catch(() => {
      if (!cancelled) setState({ mentors: [], total: 0, isLoading: false, isError: true });
    });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey, reloadKey]);

  return { ...state, reload };
}
