"use client";

import { useState } from "react";
import { LogIn, LogOut, Cloud, Loader2, RefreshCcw, Calendar } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useNotification } from "@/components/providers/notification-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { user, loading, signInWithGoogle, signOut, syncing, syncError, lastSyncedAt, syncNow, syncGoogleCalendar } = useAuth();
  const { notify } = useNotification();
  const [signingIn, setSigningIn] = useState(false);

  const handleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to sign in.";
      notify(`Sign in failed: ${message}`, { variant: "error" });
      setSigningIn(false);
    }
  };

  if (loading) {
    return (
      <div className="h-8 w-8 flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        disabled={signingIn}
        className="inline-flex items-center gap-2 h-8 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors disabled:opacity-50"
      >
        {signingIn ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <LogIn className="h-3.5 w-3.5" />
        )}
        Sign in
      </button>
    );
  }

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "U";

  const avatarUrl = user.user_metadata?.avatar_url;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 h-8 px-2 rounded-lg hover:bg-accent transition-colors">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt="Avatar"
            className="h-6 w-6 rounded-full object-cover"
          />
        ) : (
          <div className="h-6 w-6 rounded-full gradient-brand flex items-center justify-center text-[10px] font-bold text-white">
            {initials}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Cloud className="h-3 w-3 text-emerald-500" />
          <span className="text-xs text-muted-foreground hidden sm:block truncate max-w-[100px]">
            {user.user_metadata?.full_name?.split(" ")[0] ?? user.email?.split("@")[0]}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <div className="px-2 py-2">
          <p className="text-xs font-semibold truncate">
            {user.user_metadata?.full_name ?? "User"}
          </p>
          <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center gap-1">
              <Cloud className="h-2.5 w-2.5 text-emerald-500" />
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                {syncing ? "Syncing..." : syncError ? "Sync error" : "Synced to cloud"}
              </span>
            </div>
            {lastSyncedAt ? (
              <p className="text-[10px] text-muted-foreground truncate">
                Last synced {new Date(lastSyncedAt).toLocaleString()}
              </p>
            ) : null}
            {syncError ? (
              <p className="text-[10px] text-destructive truncate">{syncError}</p>
            ) : null}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={syncNow}
          disabled={syncing}
          className="text-xs gap-2 cursor-pointer"
        >
          <RefreshCcw className="h-3.5 w-3.5" />
          Sync now
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={syncGoogleCalendar}
          disabled={syncing}
          className="text-xs gap-2 cursor-pointer"
        >
          <Calendar className="h-3.5 w-3.5" />
          Sync Google Calendar
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={signOut}
          className="text-xs gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
