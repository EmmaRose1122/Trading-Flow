import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword, setSessionCookie, signTwoFactorChallenge } from "@/lib/auth";

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

    // Legacy test accounts are blocked in production unless explicitly enabled or configured.
    if (
      process.env.NODE_ENV === "production" &&
      process.env.ENABLE_DEMO_ACCOUNTS !== "true"
    ) {
      if (normalizedEmail === "user@corechain.test") {
        return NextResponse.json({ error: "This investor account is disabled in production" }, { status: 401 });
      }
      if (
        normalizedEmail === "admin@corechain.test" &&
        !hasConfiguredAdminPassword &&
        configuredAdminEmail !== "admin@corechain.test"
      ) {
        return NextResponse.json({ error: "This administrator account is disabled in production" }, { status: 401 });
      }
    }

    const user = await db.findUserByEmail(normalizedEmail);
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (user.twoFactorEnabled && user.twoFactorSecret) {
      const challengeToken = await signTwoFactorChallenge(user.id);
      return NextResponse.json({
        success: true,
        requiresTwoFactor: true,
        challengeToken,
        message: "Enter the 6-digit code from your authenticator app.",
      });
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

