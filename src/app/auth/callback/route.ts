import { NextResponse } from "next/server";
import { createClient } from "../../../../lib/supabase/server";

const ALLOWED_ABSOLUTE_REDIRECT_HOSTS = new Set([
  "localhost",
  "www.localhost",
  "app.localhost",
  "yellowpixel.io",
  "www.yellowpixel.io",
  "app.yellowpixel.io",
]);

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const redirectUrl = resolveRedirectUrl(next, requestUrl);
  return NextResponse.redirect(redirectUrl);
}

function resolveRedirectUrl(next: string | null, requestUrl: URL) {
  if (!next) {
    return new URL("/template", requestUrl.origin);
  }

  if (next.startsWith("/")) {
    return new URL(next, requestUrl.origin);
  }

  try {
    const candidate = new URL(next);
    if (ALLOWED_ABSOLUTE_REDIRECT_HOSTS.has(candidate.hostname)) {
      return candidate;
    }
  } catch {
    // Ignore invalid absolute URLs and fall back.
  }

  return new URL("/template", requestUrl.origin);
}
