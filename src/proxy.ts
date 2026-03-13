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
    return NextResponse.redirect(loginUrl);
  }

  if (user && isLoginPage) {
    const appUrl = req.nextUrl.clone();
    appUrl.pathname = "/template";
    appUrl.search = "";
    return NextResponse.redirect(appUrl);
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
