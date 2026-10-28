import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession } from "@/lib/auth";
import { db, type DepositAccount } from "@/lib/db";

async function requireAdmin() {
  const session = await getSession();
  const admin = session ? db.findUserById(session.userId) : null;
  return admin?.role === "ADMIN" ? admin : null;
}

function cleanAccount(body: Record<string, unknown>) {
  const text = (key: string, max: number) =>
    typeof body[key] === "string" ? body[key].trim().slice(0, max) : "";
  return {
    label: text("label", 80),
    method: text("method", 80),
    network: text("network", 60) || undefined,
    currency: text("currency", 20) || undefined,
    address: text("address", 240),
    accountName: text("accountName", 120) || undefined,
    instructions: text("instructions", 300) || undefined,
  };
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }
  return NextResponse.json({ accounts: db.getDepositAccounts() });
}

export async function POST(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    const fields = cleanAccount(body);
    if (!fields.label || !fields.method || fields.address.length < 3) {
      return NextResponse.json(
        { error: "Label, method and receiving address are required" },
        { status: 400 }
      );
    }
    const account: DepositAccount = {
      id: "dep_" + randomBytes(8).toString("hex"),
      label: fields.label,
      method: fields.method,
      network: fields.network,
      currency: fields.currency || "USD",
      address: fields.address,
      accountName: fields.accountName,
      instructions: fields.instructions,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
    };
    db.createDepositAccount(account);
    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Create deposit account error:", error);
    return NextResponse.json({ error: "Unable to create deposit account" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    const body = (await request.json()) as Record<string, unknown>;
    if (typeof body.id !== "string") {
      return NextResponse.json({ error: "Deposit account ID is required" }, { status: 400 });
    }
    const fields = cleanAccount(body);
    const update: Partial<DepositAccount> = {};
    if (fields.label) update.label = fields.label;
    if (fields.method) update.method = fields.method;
    if (fields.network !== undefined) update.network = fields.network;
    if (fields.currency !== undefined) update.currency = fields.currency;
    if (fields.address) {
      if (fields.address.length < 3) {
        return NextResponse.json({ error: "Enter a valid receiving address" }, { status: 400 });
      }
      update.address = fields.address;
    }
    if (fields.accountName !== undefined) update.accountName = fields.accountName;
    if (fields.instructions !== undefined) update.instructions = fields.instructions;
    if (typeof body.isActive === "boolean") update.isActive = body.isActive;

    const account = db.updateDepositAccount(body.id, update);
    if (!account) return NextResponse.json({ error: "Deposit account not found" }, { status: 404 });
    return NextResponse.json({ success: true, account });
  } catch (error) {
    console.error("Update deposit account error:", error);
    return NextResponse.json({ error: "Unable to update deposit account" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !db.deleteDepositAccount(id)) {
      return NextResponse.json({ error: "Deposit account not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete deposit account error:", error);
    return NextResponse.json({ error: "Unable to delete deposit account" }, { status: 500 });
  }
}
