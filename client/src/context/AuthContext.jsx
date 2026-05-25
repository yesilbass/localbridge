import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import supabase, { readPersistedUser } from "../api/supabase";
import {
  isSubscribed as checkSubscribed,
  isInTrial as checkInTrial,
  trialDaysRemaining as calcTrialDaysRemaining,
} from "../utils/subscriptionStatus";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readPersistedUser());
  const [loading, setLoading] = useState(() => readPersistedUser() === null);
  const [userSettings, setUserSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const loadUserSettings = useCallback(async (userId) => {
    if (!userId) {
      setUserSettings(null);
      setSettingsLoading(false);
      return;
    }
    setSettingsLoading(true);
    const { data, error } = await supabase
      .from("user_settings")
      .select("settings")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) {
      setUserSettings(null);
    } else {
      setUserSettings(data?.settings ?? null);
    }
    setSettingsLoading(false);
  }, []);

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
      if (next?.id) await loadUserSettings(next.id);
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser((prev) => (prev?.id === next?.id ? prev : next));
      if (next?.id) {
        void loadUserSettings(next.id);
      } else {
        setUserSettings(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadUserSettings]);

  const refreshUserSettings = useCallback(async () => {
    if (!user?.id) return;
    await loadUserSettings(user.id);
  }, [user?.id, loadUserSettings]);

  const subscriptionValue = useMemo(() => {
    const settings = userSettings;
    return {
      isSubscribed: checkSubscribed(settings),
      isInTrial: checkInTrial(settings),
      trialDaysRemaining: calcTrialDaysRemaining(settings),
    };
  }, [userSettings]);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setUser(data.user);
    await loadUserSettings(data.user.id);
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
    if (data.user?.id) await loadUserSettings(data.user.id);
    return data.user;
  }

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    setUserSettings(null);
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      userSettings,
      settingsLoading,
      refreshUserSettings,
      ...subscriptionValue,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
