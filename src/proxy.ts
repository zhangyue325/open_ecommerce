import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "../lib/supabase/proxy";

const APP_HOSTS = new Set([
  "app.localhost",
  "app.yellowpixel.io",
]);

const LANDING_HOSTS = new Set([
  "localhost",
  "www.localhost",
  "yellowpixel.io",
  "www.yellowpixel.io",
]);

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
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const url = req.nextUrl.clone();

  // app subdomain uses routes in /(app) directly
  if (APP_HOSTS.has(hostname)) {
    return handleAppHost(req, url);
  }

  // apex/www hosts are rewritten to /(landing)/landing/*
  if (LANDING_HOSTS.has(hostname)) {
    if (isAppRoute(url.pathname)) {
      // Local dev keeps app routes on localhost directly with the same auth guard.
      if (hostname === "localhost" || hostname === "www.localhost") {
        return handleAppHost(req, url);
      }

      // Production landing host forwards app routes to app subdomain.
      const appHostname = getAppHostname(hostname);
      if (appHostname) {
        const appUrl = req.nextUrl.clone();
        appUrl.hostname = appHostname;
        return NextResponse.redirect(appUrl);
      }
    }

    if (url.pathname === "/landing" || url.pathname.startsWith("/landing/")) {
      return NextResponse.next();
    }

    url.pathname = url.pathname === "/" ? "/landing" : `/landing${url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
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

function getAppHostname(hostname: string) {
  if (hostname === "yellowpixel.io" || hostname === "www.yellowpixel.io") {
    return "app.yellowpixel.io";
  }
  return null;
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
