import { NextRequest, NextResponse } from "next/server";

const APP_HOSTS = new Set([
  "app.localhost",
  "app.yellowpixel.io",
  "app.yellowpixel.ai",
]);

const LANDING_HOSTS = new Set([
  "localhost",
  "www.localhost",
  "yellowpixel.io",
  "www.yellowpixel.io",
  "yellowpixel.ai",
  "www.yellowpixel.ai",
]);

export function proxy(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const hostname = host.split(":")[0];
  const url = req.nextUrl.clone();

  // app subdomain uses routes in /(app) directly
  if (APP_HOSTS.has(hostname)) {
    return NextResponse.next();
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

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
