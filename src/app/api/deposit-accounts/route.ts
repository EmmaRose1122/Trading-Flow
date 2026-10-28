import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || !db.findUserById(session.userId)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const accounts = db
    .getDepositAccounts()
    .filter((account) => account.isActive)
    .map(({ id, label, method, network, currency, address, accountName, instructions }) => ({
      id,
      label,
      method,
      network,
      currency,
      address,
      accountName,
      instructions,
    }));
  return NextResponse.json({ accounts });
}
