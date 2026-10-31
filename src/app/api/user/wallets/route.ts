import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { db, type PayoutWallet } from "@/lib/db";
import { isBep20Address } from "@/lib/bep20";

const MAX_WALLETS = 10;

async function currentUser() {
  const session = await getSession();
  return session ? await db.findUserById(session.userId) : null;
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ wallets: await db.getPayoutWalletsByUserId(user.id) });
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const existing = await db.getPayoutWalletsByUserId(user.id);
    if (existing.length >= MAX_WALLETS) {
      return NextResponse.json(
        { error: `You can save up to ${MAX_WALLETS} payout wallets` },
        { status: 400 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const label = typeof body.label === "string" ? body.label.trim().slice(0, 80) : "";
    const method = typeof body.method === "string" ? body.method.trim().slice(0, 80) : "";
    const network = typeof body.network === "string" ? body.network.trim().slice(0, 60) : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (!label || !method) {
      return NextResponse.json(
        { error: "Wallet label and method are required" },
        { status: 400 }
      );
    }
    if (!isBep20Address(address)) {
      return NextResponse.json(
        { error: "Enter a valid BEP20 wallet address starting with 0x." },
        { status: 400 }
      );
    }
    if (
      existing.some(
        (wallet) =>
          wallet.address.toLowerCase() === address.toLowerCase() &&
          wallet.method.toLowerCase() === method.toLowerCase()
      )
    ) {
      return NextResponse.json({ error: "This payout wallet is already saved" }, { status: 409 });
    }

    const wallet: PayoutWallet = {
      id: "pwl_" + randomBytes(8).toString("hex"),
      userId: user.id,
      label,
      method,
      network: network || undefined,
      address,
      isProfitDestination: body.isProfitDestination === true,
      createdAt: new Date().toISOString(),
    };
    await db.createPayoutWallet(wallet);
    return NextResponse.json({ success: true, wallet });
  } catch (error) {
    console.error("Create payout wallet error:", error);
    return NextResponse.json({ error: "Unable to save payout wallet" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const body = (await request.json()) as { id?: unknown };
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Payout wallet not found" }, { status: 404 });
    }
    const wallets = await db.getPayoutWalletsByUserId(user.id);
    const wallet = wallets.find((entry) => entry.id === body.id);
    if (!wallet) {
      return NextResponse.json({ error: "Payout wallet not found" }, { status: 404 });
    }
    if (!isBep20Address(wallet.address)) {
      return NextResponse.json(
        { error: "Only BEP20 payout wallets can be used as a profit destination." },
        { status: 400 }
      );
    }
    if (!(await db.setProfitDestinationWallet(user.id, wallet.id))) {
      return NextResponse.json({ error: "Payout wallet not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update payout wallet error:", error);
    return NextResponse.json({ error: "Unable to update payout wallet" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !(await db.deletePayoutWallet(user.id, id))) {
      return NextResponse.json({ error: "Payout wallet not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete payout wallet error:", error);
    return NextResponse.json({ error: "Unable to delete payout wallet" }, { status: 500 });
  }
}
