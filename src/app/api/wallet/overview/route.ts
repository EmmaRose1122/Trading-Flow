import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  DAILY_RETURN_PERCENT,
  approvedDepositTotal,
  approvedDeposits,
  dailyDepositProfit,
  depositEligibleAt,
  eligibleDepositTotal,
  isDepositEligible,
} from "@/lib/deposit";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.findUserById(session.userId);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wallet = await db.getWalletByUserId(user.id);
  const transactions = await db.getTransactions(user.id);

  const pendingWithdrawal = transactions
    .filter((t) => t.type === "WITHDRAWAL" && t.status === "PENDING")
    .reduce((acc, t) => acc + t.amount, 0);
  const totalDeposited = approvedDepositTotal(transactions, user.id);
  const eligibleTotal = eligibleDepositTotal(transactions, user.id);
  const deposits = approvedDeposits(transactions, user.id).map((deposit) => ({
    id: deposit.id,
    amount: deposit.amount,
    method: deposit.method,
    txHash: deposit.txHash || null,
    createdAt: deposit.createdAt,
    approvedAt: deposit.approvedAt || deposit.createdAt,
    eligibleAt: depositEligibleAt(deposit).toISOString(),
    isEligible: isDepositEligible(deposit),
    dailyProfit: dailyDepositProfit(deposit.amount),
  }));

  return NextResponse.json({
    wallet,
    totalDeposited,
    eligibleDepositTotal: eligibleTotal,
    dailyRate: DAILY_RETURN_PERCENT,
    dailyProfit: dailyDepositProfit(totalDeposited),
    eligibleDailyProfit: dailyDepositProfit(eligibleTotal),
    pendingWithdrawal,
    deposits,
  });
}
