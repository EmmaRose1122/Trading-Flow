import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculateDailyProfit, roundMoney } from "@/lib/money";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db.findUserById(session.userId);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wallet = await db.getWalletByUserId(user.id);
  const investments = await db.getInvestmentsByUserId(user.id);
  const transactions = await db.getTransactions(user.id);

  const pendingWithdrawal = transactions
    .filter((t) => t.type === "WITHDRAWAL" && t.status === "PENDING")
    .reduce((acc, t) => acc + t.amount, 0);
  const activeInvestments = investments.filter((investment) => investment.status === "ACTIVE");
  const investmentProfits = activeInvestments.map((investment) => ({
    ...investment,
    dailyProfit: calculateDailyProfit(investment.investedAmount, investment.dailyPercentage),
  }));
  const dailyProfit = roundMoney(
    investmentProfits.reduce((total, investment) => total + investment.dailyProfit, 0)
  );

  return NextResponse.json({
    wallet,
    activeInvestmentsCount: activeInvestments.length,
    dailyProfit,
    investmentProfits,
    pendingWithdrawal,
    investments,
  });
}

