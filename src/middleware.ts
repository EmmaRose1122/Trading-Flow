import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("tf_session")?.value;
  if (!token || !secret || secret.length < 32) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
      issuer: "trading-flow",
      audience: "trading-flow-app",
    });
    if (req.nextUrl.pathname === "/admin" && payload.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/", "/plans", "/transactions", "/referrals", "/admin"],
};
