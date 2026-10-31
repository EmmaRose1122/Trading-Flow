import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { id?: unknown; reason?: unknown };
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Withdrawal ID is required" }, { status: 400 });
    }
    const reason = typeof body.reason === "string" ? body.reason : undefined;
    const result = await db.rejectWithdrawal(body.id, reason);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, transaction: result.transaction });
  } catch (error) {
    console.error("Admin withdrawal reject error:", error);
    return NextResponse.json({ error: "Unable to reject withdrawal" }, { status: 500 });
  }
}
