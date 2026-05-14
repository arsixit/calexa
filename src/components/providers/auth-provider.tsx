"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import type { User } from "@supabase/supabase-js";
import type { CalendarEvent } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { signInWithGoogle as initiateSignIn, signOut as initiateSignOut, getGoogleAccessToken } from "@/lib/supabase/auth";
import { fetchEvents, upsertEvents } from "@/lib/supabase/events-db";
import { fetchGoogleCalendarEvents } from "@/lib/google-calendar";
import { useNotification } from "@/components/providers/notification-provider";
import { useCalendarStore } from "@/lib/store";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  syncing: boolean;
  syncError: string | null;
  lastSyncedAt: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  syncNow: () => Promise<void>;
  syncGoogleCalendar: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  syncing: false,
  syncError: null,
  lastSyncedAt: null,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  syncNow: async () => {},
  syncGoogleCalendar: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const { notify } = useNotification();
  const { setEvents, loadUserState } = useCalendarStore();
  const hasInitialSession = useRef(true);

  const mergeEvents = (localEvents: CalendarEvent[], remoteEvents: CalendarEvent[]) => {
    const mergedById = new Map<string, CalendarEvent>();
    const remoteById = new Map(remoteEvents.map((event) => [event.id, event]));

    for (const remote of remoteEvents) {
      mergedById.set(remote.id, remote);
    }

    for (const local of localEvents) {
      const remote = remoteById.get(local.id);
      if (!remote || local.updatedAt >= remote.updatedAt) {
        mergedById.set(local.id, local);
      }
    }

    return Array.from(mergedById.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const syncOnLogin = useCallback(async (userId: string) => {
    setSyncError(null);
    setSyncing(true);
    try {
      const localEvents = useCalendarStore.getState().events;
      const remoteEvents = await fetchEvents(userId);
      const mergedEvents = localEvents.length > 0 ? mergeEvents(localEvents, remoteEvents) : remoteEvents;

      if (localEvents.length > 0) {
        const remoteById = new Map(remoteEvents.map((event) => [event.id, event]));
        const eventsToUpsert = mergedEvents.filter((event) => {
          const remote = remoteById.get(event.id);
          return !remote || event.updatedAt > remote.updatedAt;
        });

        if (eventsToUpsert.length > 0) {
          await upsertEvents(eventsToUpsert, userId);
        }
      }

      setEvents(mergedEvents);
      setLastSyncedAt(new Date().toISOString());
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Sync error:", err);
      setSyncError(message);
      notify(`Sync failed: ${message}`, { variant: "error" });
      return false;
    } finally {
      setSyncing(false);
    }
  }, [notify, setEvents]);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      loadUserState(session?.user?.id ?? null);
      if (session?.user) syncOnLogin(session.user.id);
      setLoading(false);
      hasInitialSession.current = false;
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user) {
        loadUserState(session.user.id);
        const synced = await syncOnLogin(session.user.id);
        if (!hasInitialSession.current) {
          notify(`Signed in as ${session.user.email ?? "user"}`, { variant: "success" });
          if (synced) {
            notify("Calendar synced successfully", { variant: "success" });
          }
        }
      }
      if (event === "SIGNED_OUT") {
        loadUserState(null);
        setSyncError(null);
        setSyncing(false);
        if (!hasInitialSession.current) {
          notify("Signed out successfully", { variant: "info" });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserState, notify, syncOnLogin]);

  const signInWithGoogle = async () => {
    try {
      await initiateSignIn();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to start sign in.";
      notify(`Sign in failed: ${message}`, { variant: "error" });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await initiateSignOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign out.";
      notify(`Sign out failed: ${message}`, { variant: "error" });
      console.error("Sign out error:", error);
    }
  };

  const syncGoogleCalendar = async () => {
    if (!user) {
      notify("Sign in first to sync Google Calendar.", { variant: "info" });
      return;
    }

    setSyncError(null);
    setSyncing(true);

    try {
      const accessToken = await getGoogleAccessToken();
      if (!accessToken) {
        throw new Error("Google Calendar access token is unavailable.");
      }

      const googleEvents = await fetchGoogleCalendarEvents(accessToken);
      if (googleEvents.length === 0) {
        notify("No upcoming Google Calendar events found.", { variant: "info" });
        return;
      }

      const localEvents = useCalendarStore.getState().events;
      const mergedEvents = mergeEvents(localEvents, googleEvents);
      setEvents(mergedEvents);
      await upsertEvents(mergedEvents, user.id);
      setLastSyncedAt(new Date().toISOString());
      notify(`Synced ${googleEvents.length} Google Calendar event${googleEvents.length !== 1 ? "s" : ""}.`, { variant: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("Google sync error:", err);
      setSyncError(message);
      notify(`Google Calendar sync failed: ${message}`, { variant: "error" });
    } finally {
      setSyncing(false);
    }
  };

  const syncNow = async () => {
    if (!user) return;
    const success = await syncOnLogin(user.id);
    if (success) {
      notify("Calendar synced successfully", { variant: "success" });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      syncing,
      syncError,
      lastSyncedAt,
      signInWithGoogle,
      signOut,
      syncNow,
      syncGoogleCalendar,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
