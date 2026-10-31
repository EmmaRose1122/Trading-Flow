import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import { BscWithdrawalError, verifyBep20Transaction } from "@/lib/bscWithdrawalService";

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
    const withdrawal = (await db.getWithdrawals()).find((entry) => entry.id === body.id);
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 });
    }
    if (withdrawal.status !== "FAILED") {
      return NextResponse.json(
        { error: "Only failed withdrawals can be refunded" },
        { status: 409 }
      );
    }

    let allowBroadcasted = false;
    if (withdrawal.txHash) {
      try {
        const verification = await verifyBep20Transaction(withdrawal.txHash);
        if (!verification.confirmed) {
          return NextResponse.json(
            {
              error: `Transaction is not confirmed yet (${verification.confirmations || 0} confirmations). Wait for on-chain confirmation before refunding.`,
              txHash: withdrawal.txHash,
            },
            { status: 409 }
          );
        }
        if (verification.success) {
          return NextResponse.json(
            {
              error:
                "The broadcast transaction succeeded on-chain. Do not refund; use Verify on-chain to mark this withdrawal completed.",
              txHash: withdrawal.txHash,
            },
            { status: 409 }
          );
        }
        allowBroadcasted = true;
      } catch (error) {
        const failure =
          error instanceof BscWithdrawalError
            ? error
            : new BscWithdrawalError(
                error instanceof Error ? error.message : "Unable to verify the transaction.",
                "VERIFICATION_FAILED"
              );
        const status =
          failure.code === "NOT_CONFIGURED" || failure.code === "AUTO_WITHDRAWALS_DISABLED"
            ? 503
            : 502;
        return NextResponse.json(
          { error: `On-chain verification failed: ${failure.message}`, code: failure.code },
          { status }
        );
      }
    }

    const reason = typeof body.reason === "string" ? body.reason : undefined;
    const result = await db.refundFailedWithdrawal(body.id, reason, { allowBroadcasted });
    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }
    return NextResponse.json({
      success: true,
      verifiedReverted: allowBroadcasted,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("Admin withdrawal refund error:", error);
    return NextResponse.json({ error: "Unable to refund withdrawal" }, { status: 500 });
  }
}
