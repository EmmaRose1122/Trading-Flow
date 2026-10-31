import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminAuth";
import { db } from "@/lib/db";
import {
  BscWithdrawalError,
  sendBep20Withdrawal,
} from "@/lib/bscWithdrawalService";

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

    const started = await db.beginWithdrawalProcessing(body.id);
    if ("error" in started) {
      return NextResponse.json({ error: started.error }, { status: started.status });
    }

    const withdrawal = started.transaction;
    if (!withdrawal.destination) {
      const failed = await db.markWithdrawalFailed(
        withdrawal.id,
        "Withdrawal has no BEP20 destination address."
      );
      return NextResponse.json(
        {
          error: "Withdrawal has no BEP20 destination address.",
          transaction: "transaction" in failed ? failed.transaction : withdrawal,
        },
        { status: 400 }
      );
    }

    try {
      const result = await sendBep20Withdrawal({
        to: withdrawal.destination,
        amount: withdrawal.amount,
      });
      const completed = await db.markWithdrawalCompleted(withdrawal.id, result.txHash);
      if ("error" in completed) {
        return NextResponse.json(
          {
            error: `Token transfer succeeded but database update failed: ${completed.error}. TxHash: ${result.txHash}`,
            txHash: result.txHash,
          },
          { status: 500 }
        );
      }
      return NextResponse.json({
        success: true,
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
        transaction: completed.transaction,
      });
    } catch (error) {
      const failure =
        error instanceof BscWithdrawalError
          ? error
          : new BscWithdrawalError(
              error instanceof Error ? error.message : "BSC transfer failed.",
              "TRANSFER_FAILED"
            );
      const failed = await db.markWithdrawalFailed(
        withdrawal.id,
        failure.message,
        failure.txHash
      );
      const status = failure.code === "NOT_CONFIGURED" || failure.code === "AUTO_WITHDRAWALS_DISABLED" ? 503 : 502;
      return NextResponse.json(
        {
          error: failure.message,
          code: failure.code,
          txHash: failure.txHash,
          broadcasted: failure.broadcasted,
          transaction: "transaction" in failed ? failed.transaction : withdrawal,
        },
        { status }
      );
    }
  } catch (error) {
    console.error("Admin withdrawal approve error:", error);
    return NextResponse.json({ error: "Unable to process withdrawal" }, { status: 500 });
  }
}
