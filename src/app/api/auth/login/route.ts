import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const configuredAdminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const hasConfiguredAdminPassword = Boolean(
      process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.trim().length >= 6
    );

    // In production with demo accounts disabled, ensure demo accounts cannot be logged into
    // unless this email is the explicitly configured ADMIN_EMAIL with an ADMIN_PASSWORD.
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ENABLE_DEMO_ACCOUNTS !== "true"
    ) {
      if (normalizedEmail === "user@tradingflow.com") {
        return NextResponse.json({ error: "Demo investor account is disabled in production" }, { status: 401 });
      }
      if (
        normalizedEmail === "admin@tradingflow.com" &&
        !hasConfiguredAdminPassword &&
        configuredAdminEmail !== "admin@tradingflow.com"
      ) {
        return NextResponse.json({ error: "Demo admin is disabled in production" }, { status: 401 });
      }
    }

    const user = db.findUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

