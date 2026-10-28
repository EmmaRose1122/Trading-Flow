import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { summarizeReferralNetwork } from "@/lib/referral";

export async function GET() {
  const session = await getSession();
  const admin = session ? await db.findUserById(session.userId) : null;
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const all = await db.getTransactions();
  const pending = all.filter((t) => t.status === "PENDING");
  const allUsers = await db.getUsers();
  const users = await Promise.all(
    allUsers.map(async (u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      referralCode: u.referralCode,
      referredBy: u.referredBy || null,
      createdAt: u.createdAt,
      twoFactorEnabled: Boolean(u.twoFactorEnabled),
      kycStatus: u.kycStatus || "NOT_STARTED",
      kycDetails: u.kycDetails || null,
      payoutWallets: await db.getPayoutWalletsByUserId(u.id),
      referralSummary: summarizeReferralNetwork(u.id, allUsers, all),
      wallet: await db.getWalletByUserId(u.id),
    }))
  );

  return NextResponse.json({
    pendingRequests: pending,
    allTransactions: all.slice(0, 200),
    allInvestments: await db.getAllInvestments(),
    depositAccounts: await db.getDepositAccounts(),
    users,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const admin = session ? await db.findUserById(session.userId) : null;
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { txId, action } = await req.json();

    if (!txId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const result = await db.updateTransactionStatus(txId, newStatus);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, transaction: result.transaction });
  } catch (err) {
    console.error("Admin request error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

