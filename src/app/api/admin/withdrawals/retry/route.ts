import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import { verifyBep20Transaction } from "@/lib/bscWithdrawalService";

export async function POST(request: Request) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  try {
    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Withdrawal ID is required" }, { status: 400 });
    }

    const withdrawal = (await db.getWithdrawals()).find((entry) => entry.id === body.id);
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }
    if (withdrawal.status !== "FAILED") {
      return NextResponse.json(
        { error: "Only failed withdrawals can be retried" },
        { status: 409 }
      );
    }

    if (withdrawal.txHash) {
      const verification = await verifyBep20Transaction(withdrawal.txHash);
      if (!verification.confirmed) {
        return NextResponse.json(
          {
            error: `Transaction is not confirmed yet (${verification.confirmations || 0} confirmations). Do not retry; wait and verify on BscScan.`,
            txHash: withdrawal.txHash,
          },
          { status: 409 }
        );
      }
      if (!verification.success) {
        return NextResponse.json(
          {
            error: "The broadcast transaction reverted on-chain. Do not resend automatically; refund after on-chain verification.",
            txHash: withdrawal.txHash,
          },
          { status: 409 }
        );
      }
      const completed = await db.markWithdrawalCompleted(withdrawal.id, withdrawal.txHash);
      if ("error" in completed) {
        return NextResponse.json({ error: completed.error }, { status: completed.status });
      }
      return NextResponse.json({
        success: true,
        verified: true,
        txHash: withdrawal.txHash,
        transaction: completed.transaction,
      });
    }

    const result = await db.retryWithdrawal(withdrawal.id);
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({ success: true, transaction: result.transaction });
  } catch (error) {
    console.error("Admin withdrawal retry error:", error);
    return NextResponse.json({ error: "Unable to retry withdrawal" }, { status: 500 });
  }
}
