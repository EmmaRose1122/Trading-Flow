import { NextResponse } from "next/server";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const admin = session ? db.findUserById(session.userId) : null;
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { newPassword } = await req.json();

    if (typeof newPassword !== "string" || newPassword.length < 6 || newPassword.length > 72) {
      return NextResponse.json(
        { error: "New password must be between 6 and 72 characters" },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);
    const updated = db.updateUserPassword(admin.id, newHash);

    if (!updated) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Admin password updated successfully! You can now use your new password.",
    });
  } catch (err) {
    console.error("Admin password update error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

