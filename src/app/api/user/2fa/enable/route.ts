import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateRecoveryCodes, hashRecoveryCode, verifyTotpCode } from "@/lib/totp";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!user.twoFactorPendingSecret) {
      return NextResponse.json({ error: "Start two-factor setup first" }, { status: 400 });
    }

    const body = (await request.json()) as { code?: unknown };
    if (typeof body.code !== "string" || !verifyTotpCode(user.twoFactorPendingSecret, body.code)) {
      return NextResponse.json({ error: "Invalid authenticator code" }, { status: 400 });
    }

    const recoveryCodes = generateRecoveryCodes();
    await db.updateUserSecurity(user.id, {
      twoFactorEnabled: true,
      twoFactorSecret: user.twoFactorPendingSecret,
      twoFactorPendingSecret: undefined,
      twoFactorRecoveryHashes: recoveryCodes.map(hashRecoveryCode),
    });

    return NextResponse.json({
      success: true,
      recoveryCodes,
      message: "Two-factor authentication enabled.",
    });
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json({ error: "Unable to enable two-factor authentication" }, { status: 500 });
  }
}
