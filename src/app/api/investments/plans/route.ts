import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session || !(await db.findUserById(session.userId))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const plans = (await db.getPlans()).filter((plan) => plan.isActive);
  return NextResponse.json({ plans });
}

