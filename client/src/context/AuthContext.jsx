import { createContext, useEffect, useState } from "react";
import supabase, { readPersistedUser } from "../api/supabase";
import { ensureMentorProfileForUser } from "../api/mentorOnboarding";
import { isMentorAccount } from "../utils/accountRole";

export const AuthContext = createContext(null);

async function syncMentorProfile(user) {
  if (!user || !isMentorAccount(user)) return;
  try {
    await ensureMentorProfileForUser(user);
  } catch (e) {
    console.error("Could not ensure mentor profile:", e);
  }
}

export function AuthProvider({ children }) {
  // Hydrate synchronously from localStorage so the very first render already
  // has the right user — no full-page spinner flicker on reload or tab focus.
  const [user, setUser] = useState(() => readPersistedUser());
  const [loading, setLoading] = useState(() => readPersistedUser() === null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      const next = session?.user ?? null;
      setUser((prev) => {
        // Avoid a re-render if the user object is identical.
        if (prev?.id === next?.id) return prev;
        return next;
      });
      if (next) void syncMentorProfile(next);
      if (!cancelled) setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const next = session?.user ?? null;
      setUser((prev) => (prev?.id === next?.id ? prev : next));
      if (next && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
        void syncMentorProfile(next);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    await syncMentorProfile(data.user);
    return data.user;
  }

  async function register(email, password, meta) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: meta.full_name,
          first_name: meta.full_name.split(" ")[0] ?? "",
          last_name: meta.full_name.split(" ").slice(1).join(" ") ?? "",
          role: meta.role,
        },
      },
    });
    if (error) throw error;
    setUser(data.user);
    await syncMentorProfile(data.user);
    return data.user;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
