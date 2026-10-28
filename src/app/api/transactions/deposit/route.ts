import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseMoney } from "@/lib/money";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { amount, depositAccountId, txHash, proofUrl } = await req.json();
    const depositAmount = parseMoney(amount);
    const normalizedHash = typeof txHash === "string" ? txHash.trim() : "";

    if (depositAmount === null || depositAmount < 10) {
      return NextResponse.json({ error: "Enter a valid deposit of at least $10 with up to 2 decimals" }, { status: 400 });
    }
    if (typeof depositAccountId !== "string" || !depositAccountId) {
      return NextResponse.json({ error: "Select an active deposit account" }, { status: 400 });
    }
    const depositAccount = db
      .getDepositAccounts()
      .find((account) => account.id === depositAccountId && account.isActive);
    if (!depositAccount) {
      return NextResponse.json({ error: "Selected deposit account is unavailable" }, { status: 400 });
    }
    if (normalizedHash.length < 6 || normalizedHash.length > 128) {
      return NextResponse.json({ error: "A valid transaction hash or reference is required" }, { status: 400 });
    }
    const duplicate = db.getTransactions().some(
      (entry) => entry.type === "DEPOSIT" && entry.txHash?.toLowerCase() === normalizedHash.toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json({ error: "This transaction reference has already been submitted" }, { status: 409 });
    }

    const tx = db.createTransaction({
      id: "TX-" + Math.floor(1000000 + Math.random() * 9000000),
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      type: "DEPOSIT",
      amount: depositAmount,
      fee: 0,
      status: "PENDING",
      method: `${depositAccount.method}${depositAccount.network ? ` · ${depositAccount.network}` : ""}`,
      txHash: normalizedHash,
      destination: depositAccount.address,
      proofUrl: typeof proofUrl === "string" ? proofUrl : undefined,
      depositAccountId: depositAccount.id,
      note: `Deposit to ${depositAccount.label}`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, transaction: tx });
  } catch (err) {
    console.error("Deposit error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

