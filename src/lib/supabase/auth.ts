import { createClient } from "./client";
import type { User } from "@supabase/supabase-js";

export async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: "https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.events.readonly",
    },
  });
  if (error) throw error;
}

export async function getGoogleAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session?.provider_token ?? null;
}

export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}
