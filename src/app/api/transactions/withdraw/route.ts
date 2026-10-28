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

    const { amount, method, destination } = await req.json();
    const withdrawAmount = parseMoney(amount);
    const normalizedDestination = typeof destination === "string" ? destination.trim() : "";

    if (withdrawAmount === null || withdrawAmount < 20) {
      return NextResponse.json({ error: "Enter a valid withdrawal of at least $20 with up to 2 decimals" }, { status: 400 });
    }

    if (normalizedDestination.length < 6 || normalizedDestination.length > 128) {
      return NextResponse.json({ error: "A valid destination wallet address is required" }, { status: 400 });
    }

    const wallet = db.getWalletByUserId(user.id);
    const fee = roundMoney(withdrawAmount * 0.02);
    const totalDeduction = roundMoney(withdrawAmount + fee);

    if (!wallet || wallet.currentBalance < totalDeduction) {
      return NextResponse.json(
        { error: `Insufficient balance. Total required with fee ($${fee.toFixed(2)}) is $${totalDeduction.toFixed(2)}` },
        { status: 400 }
      );
    }

    db.updateWallet(user.id, {
      currentBalance: roundMoney(wallet.currentBalance - totalDeduction),
    });

    const tx = db.createTransaction({
      id: "TX-" + Math.floor(1000000 + Math.random() * 9000000),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      type: "WITHDRAWAL",
      amount: withdrawAmount,
      fee,
      status: "PENDING",
      method: typeof method === "string" && method.trim() ? method.trim() : "USDT (TRC20)",
      destination: normalizedDestination,
      note: "Withdrawal request queued for processing",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (err) {
    console.error("Withdraw error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

