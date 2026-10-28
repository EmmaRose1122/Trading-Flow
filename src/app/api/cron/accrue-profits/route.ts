import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

export const maxDuration = 60;

function isAuthorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  const authorization = req.headers.get("authorization") || "";
  const expected = `Bearer ${secret || ""}`;
  if (!secret || secret.length < 32 || authorization.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(authorization), Buffer.from(expected));
}

async function handler(req: Request) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = db.accrueProfits();
    return NextResponse.json({ success: true, ...summary });
  } catch (error) {
    console.error("Profit accrual error:", error);
    return NextResponse.json({ error: "Profit accrual failed" }, { status: 500 });
  }
}

export { handler as GET, handler as POST };
