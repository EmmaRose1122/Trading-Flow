import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  const admin = session ? await db.findUserById(session.userId) : null;
  if (!admin || admin.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
  }

  const users = (await db.getUsers()).filter((user) => user.role !== "ADMIN");
  return NextResponse.json({
    pendingKyc: users.filter((user) => user.kycStatus === "PENDING"),
    kycUsers: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      kycStatus: user.kycStatus || "NOT_STARTED",
      kycDetails: user.kycDetails || null,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    const admin = session ? await db.findUserById(session.userId) : null;
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = (await request.json()) as {
      userId?: unknown;
      action?: unknown;
      reason?: unknown;
    };
    if (typeof body.userId !== "string" || (body.action !== "APPROVE" && body.action !== "REJECT")) {
      return NextResponse.json({ error: "Invalid KYC review request" }, { status: 400 });
    }
    const user = await db.findUserById(body.userId);
    if (!user || user.role === "ADMIN" || !user.kycDetails) {
      return NextResponse.json({ error: "KYC application not found" }, { status: 404 });
    }
    if (user.kycStatus !== "PENDING") {
      return NextResponse.json({ error: "KYC application is not pending" }, { status: 409 });
    }

    const reason = typeof body.reason === "string" ? body.reason.trim() : "";
    const kycDetails = {
      ...user.kycDetails,
      reviewedAt: new Date().toISOString(),
      rejectionReason: body.action === "REJECT" ? reason || "Verification requirements not met" : undefined,
    };
    await db.updateUserSecurity(user.id, {
      kycStatus: body.action === "APPROVE" ? "APPROVED" : "REJECTED",
      kycDetails,
    });

    return NextResponse.json({
      success: true,
      status: body.action === "APPROVE" ? "APPROVED" : "REJECTED",
    });
  } catch (error) {
    console.error("KYC review error:", error);
    return NextResponse.json({ error: "Unable to review KYC application" }, { status: 500 });
  }
}
