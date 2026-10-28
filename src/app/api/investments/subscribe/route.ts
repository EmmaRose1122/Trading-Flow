import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseMoney, roundMoney } from "@/lib/money";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { planId, amount } = await req.json();
    const investAmount = parseMoney(amount);

    if (typeof planId !== "string" || investAmount === null || investAmount <= 0) {
      return NextResponse.json({ error: "Invalid plan or amount" }, { status: 400 });
    }

    const plan = db.getPlanById(planId);
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Selected plan is unavailable" }, { status: 404 });
    }

    if (investAmount < plan.minAmount || investAmount > plan.maxAmount) {
      return NextResponse.json(
        { error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount}` },
        { status: 400 }
      );
    }

    const wallet = db.getWalletByUserId(user.id);
    if (!wallet || wallet.currentBalance < investAmount) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    db.updateWallet(user.id, {
      currentBalance: roundMoney(wallet.currentBalance - investAmount),
      totalInvested: roundMoney(wallet.totalInvested + investAmount),
    });

    const investment = db.createInvestment({
      id: "inv_" + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      planId: plan.id,
      planName: plan.name,
      investedAmount: investAmount,
      dailyPercentage: plan.dailyPercentage,
      durationDays: plan.durationDays,
      remainingDays: plan.durationDays,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
    });

    db.createTransaction({
      id: "TX-" + Math.floor(1000000 + Math.random() * 9000000),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      type: "INVESTMENT",
      amount: investAmount,
      fee: 0,
      status: "SUCCESS",
      method: "Internal Balance",
      note: `Subscribed to ${plan.name}`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, investment });
  } catch (err) {
    console.error("Investment subscribe error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

