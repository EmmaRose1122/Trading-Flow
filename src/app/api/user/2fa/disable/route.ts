import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { getSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { hashRecoveryCode, verifyTotpCode } from "@/lib/totp";

function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.findUserById(session.userId);
    if (!user?.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ error: "Two-factor authentication is not enabled" }, { status: 400 });
    }

    const body = (await request.json()) as { password?: unknown; code?: unknown };
    if (typeof body.password !== "string" || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (typeof body.code !== "string") {
      return NextResponse.json({ error: "Authentication code is required" }, { status: 400 });
    }

    const code = body.code.trim();
    const recoveryMatch =
      /^\d{6}$/.test(code) === false &&
      (user.twoFactorRecoveryHashes || []).some((hash) =>
        safeEqual(hash, hashRecoveryCode(code))
      );
    if (!verifyTotpCode(user.twoFactorSecret, code) && !recoveryMatch) {
      return NextResponse.json({ error: "Invalid authentication code" }, { status: 400 });
    }

    await db.updateUserSecurity(user.id, {
      twoFactorEnabled: false,
      twoFactorSecret: undefined,
      twoFactorPendingSecret: undefined,
      twoFactorRecoveryHashes: [],
    });
    return NextResponse.json({ success: true, message: "Two-factor authentication disabled." });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json({ error: "Unable to disable two-factor authentication" }, { status: 500 });
  }
}
