import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseMoney, roundMoney } from "@/lib/money";
import {
  MIN_WITHDRAWAL,
  WITHDRAWAL_COOLDOWN_MS,
  mostRecentWithdrawal,
} from "@/lib/deposit";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, method, destination, payoutWalletId } = await req.json();
    const withdrawAmount = parseMoney(amount);

    if (user.kycStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "KYC verification must be approved before you can withdraw funds." },
        { status: 403 }
      );
    }
    if (withdrawAmount === null || withdrawAmount < MIN_WITHDRAWAL) {
      return NextResponse.json({ error: `Enter a valid withdrawal of at least $${MIN_WITHDRAWAL} with up to 2 decimals` }, { status: 400 });
    }

    const withdrawals = await db.getTransactions(user.id);
    const lastWithdrawal = mostRecentWithdrawal(withdrawals);
    if (lastWithdrawal) {
      const nextAllowedAt = new Date(lastWithdrawal.createdAt).getTime() + WITHDRAWAL_COOLDOWN_MS;
      if (Date.now() < nextAllowedAt) {
        return NextResponse.json(
          {
            error: `Withdrawals are available once every 24 hours. Next request allowed after ${new Date(
              nextAllowedAt
            ).toLocaleString("en-GB")}.`,
          },
          { status: 429 }
        );
      }
    }

    let payoutAddress = typeof destination === "string" ? destination.trim() : "";
    let payoutMethod = typeof method === "string" && method.trim() ? method.trim() : "USDT (TRC20)";
    let savedWalletId: string | undefined;

    if (typeof payoutWalletId === "string" && payoutWalletId) {
      const savedWallet = (await db.getPayoutWalletsByUserId(user.id)).find(
        (wallet) => wallet.id === payoutWalletId
      );
      if (!savedWallet) {
        return NextResponse.json({ error: "Payout wallet not found" }, { status: 400 });
      }
      payoutAddress = savedWallet.address;
      payoutMethod = savedWallet.network
        ? `${savedWallet.method} · ${savedWallet.network}`
        : savedWallet.method;
      savedWalletId = savedWallet.id;
    }

    if (payoutAddress.length < 6 || payoutAddress.length > 240) {
      return NextResponse.json({ error: "A valid destination wallet address is required" }, { status: 400 });
    }
    if (payoutMethod.length > 120) {
      return NextResponse.json({ error: "Payout method is too long" }, { status: 400 });
    }

    const wallet = await db.getWalletByUserId(user.id);
    const fee = roundMoney(withdrawAmount * 0.02);
    const totalDeduction = roundMoney(withdrawAmount + fee);

    if (!wallet || wallet.currentBalance < totalDeduction) {
      return NextResponse.json(
        { error: `Insufficient balance. Total required with fee ($${fee.toFixed(2)}) is $${totalDeduction.toFixed(2)}` },
        { status: 400 }
      );
    }

    await db.updateWallet(user.id, {
      currentBalance: roundMoney(wallet.currentBalance - totalDeduction),
    });

    const tx = await db.createTransaction({
      id: "TX-" + Math.floor(1000000 + Math.random() * 9000000),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      type: "WITHDRAWAL",
      amount: withdrawAmount,
      fee,
      status: "PENDING",
      method: payoutMethod,
      destination: payoutAddress,
      payoutWalletId: savedWalletId,
      note: savedWalletId
        ? "Withdrawal request queued to saved payout wallet"
        : "Withdrawal request queued for processing",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (err) {
    console.error("Withdraw error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

