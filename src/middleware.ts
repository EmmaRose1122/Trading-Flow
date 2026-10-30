import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;
const protectedPaths = new Set([
  "/dashboard",
  "/plans",
  "/transactions",
  "/referrals",
  "/profile",
  "/settings",
  "/admin",
]);

function buildCsp(nonce: string) {
  const isDevelopment = process.env.NODE_ENV !== "production";
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    "style-src 'self'",
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "media-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

function nonceResponse(request: NextRequest, nonce: string, csp: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

function redirectResponse(request: NextRequest, path: string, csp: string) {
  const response = NextResponse.redirect(new URL(path, request.url));
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export async function middleware(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);
  const { pathname } = request.nextUrl;

  if (!protectedPaths.has(pathname)) {
    return nonceResponse(request, nonce, csp);
  }

  const token = request.cookies.get("tf_session")?.value;
  if (!token || !secret || secret.length < 32) {
    return redirectResponse(request, "/login", csp);
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "trading-flow",
      audience: "trading-flow-app",
    });
    if (pathname === "/admin" && payload.role !== "ADMIN") {
      return redirectResponse(request, "/dashboard", csp);
    }
    return nonceResponse(request, nonce, csp);
  } catch {
    return redirectResponse(request, "/login", csp);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|brand/|downloads/|opengraph-image).*)",
  ],
};
