import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim().toLowerCase() || "";
  const type = searchParams.get("type")?.toUpperCase() || "ALL";
  const status = searchParams.get("status")?.toUpperCase() || "ALL";
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(searchParams.get("limit") || "50", 10) || 50));
  const currentUser = await db.findUserById(session.userId);
  if (!currentUser) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isGlobal = currentUser.role === "ADMIN" && searchParams.get("scope") === "all";
  let txs = await db.getTransactions(isGlobal ? undefined : currentUser.id);

  if (type !== "ALL") txs = txs.filter((t) => t.type === type);
  if (status !== "ALL") txs = txs.filter((t) => t.status === status);

  if (search) {
    txs = txs.filter(
      (t) =>
        t.id.toLowerCase().includes(search) ||
        t.type.toLowerCase().includes(search) ||
        t.status.toLowerCase().includes(search) ||
        t.amount.toFixed(2).includes(search) ||
        t.method.toLowerCase().includes(search) ||
        (t.txHash && t.txHash.toLowerCase().includes(search)) ||
        (t.note && t.note.toLowerCase().includes(search)) ||
        (t.userEmail && t.userEmail.toLowerCase().includes(search))
    );
  }

  const total = txs.length;
  const transactions = txs.slice((page - 1) * limit, page * limit);
  return NextResponse.json({
    transactions,
    pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  });
}

