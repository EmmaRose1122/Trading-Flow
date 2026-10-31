import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import { getBscWithdrawalStatus } from "@/lib/bscWithdrawalService";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const withdrawals = await db.getWithdrawals();
  return NextResponse.json({
    withdrawals,
    bsc: getBscWithdrawalStatus(),
  });
}
