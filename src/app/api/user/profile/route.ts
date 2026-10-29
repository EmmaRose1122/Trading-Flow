import { NextResponse } from "next/server";
import { getSession, setSessionCookie } from "@/lib/auth";
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
import { summarizeReferralNetwork } from "@/lib/referral";

async function profileResponse(userId: string) {
  const user = await db.findUserById(userId);
  if (!user) return null;

  const wallet = await db.getWalletByUserId(user.id);
  const transactions = [...(await db.getTransactions(user.id))].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
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

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      referralCode: user.referralCode,
      referredBy: user.referredBy || null,
      createdAt: user.createdAt,
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      recoveryCodeCount: user.twoFactorRecoveryHashes?.length || 0,
      kycStatus: user.kycStatus || "NOT_STARTED",
      kycDetails: user.kycDetails || null,
    },
    wallet,
    deposits,
    totalDeposited,
    eligibleDepositTotal: eligibleTotal,
    dailyRate: DAILY_RETURN_PERCENT,
    dailyProfit: dailyDepositProfit(totalDeposited),
    eligibleDailyProfit: dailyDepositProfit(eligibleTotal),
    transactions,
    payoutWallets: await db.getPayoutWalletsByUserId(user.id),
    referralSummary: summarizeReferralNetwork(user.id, await db.getUsers(), transactions),
    metrics: {
      depositCount: deposits.length,
      eligibleDepositCount: deposits.filter((deposit) => deposit.isEligible).length,
      transactionCount: transactions.length,
    },
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await profileResponse(session.userId);
  if (!profile) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(profile);
}

export async function PATCH(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = (await request.json()) as { name?: unknown; email?: unknown };
    if (typeof body.name !== "string" || typeof body.email !== "string") {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const name = body.name.trim();
    const email = body.email.trim().toLowerCase();
    if (name.length < 2 || name.length > 80) {
      return NextResponse.json({ error: "Name must be between 2 and 80 characters" }, { status: 400 });
    }
    if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }

    const existing = await db.findUserByEmail(email);
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const updated = await db.updateUserProfile(user.id, { name, email });
    if (!updated) return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });

    await setSessionCookie({
      userId: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        referralCode: updated.referralCode,
        referredBy: updated.referredBy || null,
        createdAt: updated.createdAt,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Unable to update profile" }, { status: 500 });
  }
}
