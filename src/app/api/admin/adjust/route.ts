import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseMoney, roundMoney } from "@/lib/money";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const admin = session ? await db.findUserById(session.userId) : null;
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { userId, type, amount, note } = await req.json();
    const adjustAmount = parseMoney(amount);
    const auditReason = typeof note === "string" ? note.trim() : "";

    if (typeof userId !== "string" || adjustAmount === null || adjustAmount <= 0) {
      return NextResponse.json({ error: "Valid User ID and positive amount are required" }, { status: 400 });
    }
    if (!auditReason) {
      return NextResponse.json({ error: "An audit reason is required" }, { status: 400 });
    }

    const targetUser = await db.findUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    const wallet = await db.getWalletByUserId(userId);
    if (!wallet) {
      return NextResponse.json({ error: "Target wallet not found" }, { status: 404 });
    }

    let newBalance = wallet.currentBalance;
    if (type === "CREDIT") {
      newBalance = roundMoney(newBalance + adjustAmount);
    } else if (type === "DEBIT") {
      if (wallet.currentBalance < adjustAmount) {
        return NextResponse.json({ error: "Cannot debit more than current balance" }, { status: 400 });
      }
      newBalance = roundMoney(newBalance - adjustAmount);
    } else {
      return NextResponse.json({ error: "Type must be CREDIT or DEBIT" }, { status: 400 });
    }

    await db.updateWallet(userId, { currentBalance: newBalance });

    const tx = await db.createTransaction({
      id: "TX-ADJ-" + Math.floor(100000 + Math.random() * 900000),
      userId,
      userEmail: targetUser.email,
      userName: targetUser.name,
      type: "BONUS",
      amount: type === "DEBIT" ? -adjustAmount : adjustAmount,
      fee: 0,
      status: "SUCCESS",
      method: "Admin Adjustment (" + type + ")",
      note: auditReason,
      adminId: admin.id,
      previousBalance: wallet.currentBalance,
      newBalance,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, newBalance, transaction: tx });
  } catch (err) {
    console.error("Admin adjust error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

