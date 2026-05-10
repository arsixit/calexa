"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { fetchEvents, syncLocalToCloud } from "@/lib/supabase/events-db";
import { useCalendarStore } from "@/lib/store";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { events, setEvents } = useCalendarStore();

  const syncOnLogin = useCallback(async (userId: string) => {
    try {
      // First push any local events to cloud
      const localEvents = useCalendarStore.getState().events;
      if (localEvents.length > 0) {
        await syncLocalToCloud(localEvents, userId);
      }
      // Then fetch all cloud events (merged)
      const cloudEvents = await fetchEvents();
      setEvents(cloudEvents);
    } catch (err) {
      console.error("Sync error:", err);
    }
  }, [setEvents]);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) syncOnLogin(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user) {
        await syncOnLogin(session.user.id);
      }
      if (event === "SIGNED_OUT") {
        setEvents([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [syncOnLogin]);

  const signInWithGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
