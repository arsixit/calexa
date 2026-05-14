import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const redirectWithError = (message: string) =>
    NextResponse.redirect(`${origin}/auth?status=error&message=${encodeURIComponent(message)}`);

  if (error || errorDescription) {
    const message = errorDescription || error || "OAuth sign-in failed.";
    return redirectWithError(message);
  }

  if (code) {
    try {
      const supabase = await createClient();
      await supabase.auth.exchangeCodeForSession(code);
      return NextResponse.redirect(`${origin}/auth?status=success`);
    } catch (exchangeError) {
      const message = exchangeError instanceof Error ? exchangeError.message : "Unable to exchange code for session.";
      return redirectWithError(message);
    }
  }

  return redirectWithError("Missing authorization code.");
}
