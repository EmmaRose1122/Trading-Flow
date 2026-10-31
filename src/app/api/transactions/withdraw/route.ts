import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseMoney, roundMoney } from "@/lib/money";
import { MIN_WITHDRAWAL } from "@/lib/deposit";
import { isValidBep20Address } from "@/lib/bscWithdrawalService";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, destination, payoutWalletId } = await req.json();
    const withdrawAmount = parseMoney(amount);

    if (user.kycStatus !== "APPROVED") {
      return NextResponse.json(
        { error: "KYC verification must be approved before you can withdraw funds." },
        { status: 403 }
      );
    }
    if (withdrawAmount === null || withdrawAmount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { error: `Enter a valid withdrawal of at least $${MIN_WITHDRAWAL} with up to 2 decimals` },
        { status: 400 }
      );
    }

    let payoutAddress = typeof destination === "string" ? destination.trim() : "";
    let savedWalletId: string | undefined;

    if (typeof payoutWalletId === "string" && payoutWalletId) {
      const savedWallet = (await db.getPayoutWalletsByUserId(user.id)).find(
        (wallet) => wallet.id === payoutWalletId
      );
      if (!savedWallet) {
        return NextResponse.json({ error: "Payout wallet not found" }, { status: 400 });
      }
      payoutAddress = savedWallet.address;
      savedWalletId = savedWallet.id;
    }

    if (!isValidBep20Address(payoutAddress)) {
      return NextResponse.json(
        { error: "Enter a valid BEP20 wallet address starting with 0x." },
        { status: 400 }
      );
    }

    const fee = roundMoney(withdrawAmount * 0.02);
    const result = await db.createWithdrawalRequest({
      id: "TX-" + Math.floor(1000000 + Math.random() * 9000000),
      userId: user.id,
      amount: withdrawAmount,
      fee,
      method: "BEP20 Token (BSC)",
      destination: payoutAddress,
      payoutWalletId: savedWalletId,
      note: savedWalletId
        ? "BEP20 withdrawal request queued to saved payout wallet"
        : "BEP20 withdrawal request queued for admin approval",
    });

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, transaction: result.transaction });
  } catch (err) {
    console.error("Withdraw error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

