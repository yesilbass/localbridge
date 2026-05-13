import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables. Check your .env file.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: { eventsPerSecond: 5 },
  },
});

// Synchronous best-effort read of the persisted Supabase session so the app
// can hydrate `user` on the very first render — eliminates the full-page
// spinner flash whenever the tab is reloaded or regains focus. Falls back
// to null if anything is missing or corrupt; the auth listener will catch up.
export function readPersistedUser() {
  if (typeof window === "undefined") return null;
  try {
    // Supabase v2 default storage key is `sb-<project-ref>-auth-token`.
    let key = null;
    for (let i = 0; i < window.localStorage.length; i += 1) {
      const k = window.localStorage.key(i);
      if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) { key = k; break; }
    }
    if (!key) return null;
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const session = parsed?.currentSession ?? parsed;
    const user = session?.user ?? null;
    if (!user) return null;
    const expiresAt = session?.expires_at ? session.expires_at * 1000 : 0;
    if (expiresAt && expiresAt < Date.now() - 60_000) return null;
    return user;
  } catch {
    return null;
  }
}

export default supabase;
