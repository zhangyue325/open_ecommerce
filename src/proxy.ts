import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "../lib/supabase/proxy";

const APP_ROUTE_PREFIXES = [
  "/login",
  "/auth/callback",
  "/template",
  "/generation",
  "/setting",
  "/test",
  "/scan",
];

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();

  // App routes run with auth/session handling on every host.
  if (isAppRoute(url.pathname)) {
    return handleAppHost(req, url);
  }

  if (url.pathname === "/landing" || url.pathname.startsWith("/landing/")) {
    return NextResponse.next();
  }

  url.pathname = url.pathname === "/" ? "/landing" : `/landing${url.pathname}`;
  return NextResponse.rewrite(url);
}

async function handleAppHost(req: NextRequest, url: URL) {
  const { response, user } = await updateSession(req);
  const isLoginPage = url.pathname === "/login";
  const isAuthCallback = url.pathname.startsWith("/auth/callback");

  if (!user && !isLoginPage && !isAuthCallback) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", `${url.pathname}${url.search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    const nextPath = getSafeNextPath(url.searchParams.get("next"));
    const appUrl = req.nextUrl.clone();

    if (nextPath) {
      appUrl.pathname = nextPath.pathname;
      appUrl.search = nextPath.search;
    } else {
      appUrl.pathname = "/template";
      appUrl.search = "";
    }

    return NextResponse.redirect(appUrl);
  }

  return response;
}

function isAppRoute(pathname: string) {
  return APP_ROUTE_PREFIXES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function getSafeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return null;
  }

  try {
    const parsed = new URL(nextPath, "http://localhost");
    if (parsed.pathname === "/login") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
