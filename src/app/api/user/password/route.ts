import { NextResponse } from "next/server";
import { getSession, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as {
      currentPassword?: unknown;
      newPassword?: unknown;
    };
    if (typeof body.currentPassword !== "string" || typeof body.newPassword !== "string") {
      return NextResponse.json(
        { error: "Current and new password are required" },
        { status: 400 }
      );
    }
    if (body.newPassword.length < 8 || body.newPassword.length > 72) {
      return NextResponse.json(
        { error: "New password must be between 8 and 72 characters" },
        { status: 400 }
      );
    }

    const valid = await verifyPassword(body.currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }
    if (body.currentPassword === body.newPassword) {
      return NextResponse.json({ error: "New password must be different" }, { status: 400 });
    }

    const passwordHash = await hashPassword(body.newPassword);
    const updated = await db.updateUserPassword(user.id, passwordHash);
    if (!updated) {
      return NextResponse.json({ error: "Unable to update password" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Password update error:", error);
    return NextResponse.json({ error: "Unable to update password" }, { status: 500 });
  }
}
