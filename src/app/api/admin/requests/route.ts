import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  const admin = session ? db.findUserById(session.userId) : null;
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const all = db.getTransactions();
  const pending = all.filter((t) => t.status === "PENDING");
  const users = db.getUsers().map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    referralCode: u.referralCode,
    referredBy: u.referredBy || null,
    wallet: db.getWalletByUserId(u.id),
  }));

  return NextResponse.json({
    pendingRequests: pending,
    allTransactions: all.slice(0, 50),
    users,
  });
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const admin = session ? db.findUserById(session.userId) : null;
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { txId, action } = await req.json();

    if (!txId || !["APPROVE", "REJECT"].includes(action)) {
      return NextResponse.json({ error: "Invalid request parameters" }, { status: 400 });
    }

    const newStatus = action === "APPROVE" ? "APPROVED" : "REJECTED";
    const result = db.updateTransactionStatus(txId, newStatus);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    return NextResponse.json({ success: true, transaction: result.transaction });
  } catch (err) {
    console.error("Admin request error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

