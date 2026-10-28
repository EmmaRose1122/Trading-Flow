import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";
import { setSessionCookie, verifyTwoFactorChallenge } from "@/lib/auth";
import { hashRecoveryCode, verifyTotpCode } from "@/lib/totp";

const attempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 5 * 60_000;

function isRateLimited(userId: string) {
  const now = Date.now();
  const current = attempts.get(userId);
  if (!current || current.resetAt <= now) {
    attempts.set(userId, { count: 1, resetAt: now + ATTEMPT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_ATTEMPTS;
}

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function consumeRecoveryCode(userId: string, code: string) {
  const user = db.findUserById(userId);
  if (!user?.twoFactorRecoveryHashes?.length) return false;
  const hash = hashRecoveryCode(code);
  const matchIndex = user.twoFactorRecoveryHashes.findIndex((stored) => safeEqual(stored, hash));
  if (matchIndex === -1) return false;

  const remaining = user.twoFactorRecoveryHashes.filter((_, index) => index !== matchIndex);
  db.updateUserSecurity(userId, { twoFactorRecoveryHashes: remaining });
  return true;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { challengeToken?: unknown; code?: unknown };
    if (typeof body.challengeToken !== "string" || typeof body.code !== "string") {
      return NextResponse.json({ error: "Challenge and code are required" }, { status: 400 });
    }
    const userId = await verifyTwoFactorChallenge(body.challengeToken);
    if (!userId) {
      return NextResponse.json(
        { error: "This verification request expired. Please sign in again." },
        { status: 401 }
      );
    }
    if (isRateLimited(userId)) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait five minutes." },
        { status: 429 }
      );
    }

    const user = db.findUserById(userId);
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "Two-factor authentication is not enabled" }, { status: 400 });
    }

    const code = body.code.trim();
    const valid = /^\d{6}$/.test(code)
      ? verifyTotpCode(user.twoFactorSecret, code)
      : consumeRecoveryCode(userId, code);

    if (!valid) {
      return NextResponse.json({ error: "Invalid authentication code" }, { status: 401 });
    }

    attempts.delete(userId);
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
    console.error("Two-factor login error:", error);
    return NextResponse.json({ error: "Unable to verify authentication code" }, { status: 500 });
  }
}
