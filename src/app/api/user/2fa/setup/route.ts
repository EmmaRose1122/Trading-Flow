import { NextResponse } from "next/server";
import { getSession, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { buildTotpUri, generateTotpSecret } from "@/lib/totp";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: "Two-factor authentication is already enabled" }, { status: 409 });
    }

    const body = (await request.json()) as { password?: unknown };
    if (typeof body.password !== "string" || !(await verifyPassword(body.password, user.passwordHash))) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const secret = generateTotpSecret();
    db.updateUserSecurity(user.id, { twoFactorPendingSecret: secret });
    return NextResponse.json({
      secret,
      otpauthUri: buildTotpUri(secret, user.email),
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json({ error: "Unable to start two-factor setup" }, { status: 500 });
  }
}
