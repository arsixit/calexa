"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { useNotification } from "@/components/providers/notification-provider";

interface AuthStatusProps {
  status?: string | null;
  message?: string | null;
}

export default function AuthStatus({ status, message }: AuthStatusProps) {
  const router = useRouter();
  const { signInWithGoogle } = useAuth();
  const { notify } = useNotification();
  const [retrying, setRetrying] = useState(false);
  const isSuccess = status === "success";
  const title = isSuccess ? "Signed in successfully" : "Sign in failed";
  const description = isSuccess
    ? "You are now signed in to Calexa. Redirecting to your calendar shortly."
    : message
      ? `Sign in could not be completed: ${decodeURIComponent(message)}.`
      : "Sign in could not be completed. Please try again.";

  useEffect(() => {
    if (status) {
      notify(
        isSuccess ? "Signed in successfully." : `Sign in failed: ${decodeURIComponent(message ?? "Unknown error.")}`,
        { variant: isSuccess ? "success" : "error" }
      );
    }
  }, [isSuccess, message, notify, status]);

  useEffect(() => {
    if (isSuccess) {
      const timeout = setTimeout(() => {
        router.push("/");
      }, 3200);
      return () => clearTimeout(timeout);
    }
  }, [isSuccess, router]);

  const handleRetrySignIn = async () => {
    setRetrying(true);
    try {
      await signInWithGoogle();
    } catch {
      setRetrying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 text-center">
      <div className="w-full max-w-md rounded-3xl border border-border/70 bg-panel/95 p-8 shadow-xl shadow-black/5 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-muted text-muted-foreground mb-6">
          {isSuccess ? <CheckCircle2 className="h-8 w-8 text-emerald-600" /> : <XCircle className="h-8 w-8 text-rose-600" />}
        </div>
        <h1 className="text-xl font-semibold mb-2">{title}</h1>
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        {message && !isSuccess ? (
          <p className="text-sm text-destructive mb-6 break-words">Error: {decodeURIComponent(message)}</p>
        ) : null}
        <div className="flex flex-col gap-3">
          <Link href="/" className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
            Open calendar
          </Link>
          {!isSuccess ? (
            <button
              type="button"
              onClick={handleRetrySignIn}
              disabled={retrying}
              className="inline-flex items-center justify-center rounded-2xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent transition-colors disabled:opacity-50"
            >
              {retrying ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Retrying...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign in again
                </span>
              )}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
