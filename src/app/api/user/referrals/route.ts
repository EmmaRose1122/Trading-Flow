import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  REFERRAL_LEVEL_RATES,
  summarizeReferralNetwork,
} from "@/lib/referral";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.findUserById(session.userId);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = await db.getUsers();
  const userTransactions = await db.getTransactions(user.id);
  const summary = summarizeReferralNetwork(user.id, users, await db.getTransactions());
  const commissions = userTransactions
    .filter((tx) => tx.type === "REFERRAL")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 25)
    .map((tx) => ({
      id: tx.id,
      amount: tx.amount,
      level: tx.referralLevel || 0,
      sourceUserName: tx.sourceUserName || "Network partner",
      note: tx.note || "",
      createdAt: tx.createdAt,
    }));

  return NextResponse.json({
    referralCode: user.referralCode,
    level: summary.level,
    referredBy: summary.referredBy,
    directCount: summary.directCount,
    networkCount: summary.networkCount,
    totalEarnings: summary.totalEarnings,
    commissionCount: summary.commissionCount,
    upline: summary.upline,
    rates: REFERRAL_LEVEL_RATES,
    levels: summary.levels.map((level) => ({
      level: level.level,
      rate: level.rate,
      count: level.count,
      earnings: level.earnings,
      members: level.members.map((member) => ({
        id: member.id,
        name: member.name,
        referralCode: member.referralCode,
      })),
    })),
    commissions,
  });
}
