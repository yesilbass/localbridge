import { createContext, useEffect, useState } from "react";
import supabase, { readPersistedUser } from "../api/supabase";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readPersistedUser());
  const [loading, setLoading] = useState(() => readPersistedUser() === null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (cancelled) return;
      const next = session?.user ?? null;
      setUser((prev) => {
        if (prev?.id === next?.id) return prev;
        return next;
      });
      if (!cancelled) setLoading(false);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser((prev) => (prev?.id === next?.id ? prev : next));
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
          role: meta.role ?? "mentee",
        },
      },
    });
    if (error) throw error;
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
