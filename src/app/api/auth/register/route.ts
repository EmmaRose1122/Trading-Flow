import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { hashPassword, setSessionCookie } from "@/lib/auth";
import { PLATFORM_REFERRAL_CODE, normalizeReferralCode } from "@/lib/referral";

export async function POST(req: Request) {
  try {
    const { email, password, name, referredBy } = await req.json();

    if (typeof email !== "string" || typeof password !== "string" || typeof name !== "string") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const referral =
      normalizeReferralCode(typeof referredBy === "string" ? referredBy : "") ||
      PLATFORM_REFERRAL_CODE;

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !normalizedName) {
      return NextResponse.json({ error: "A valid name and email are required" }, { status: 400 });
    }
    if (password.length < 6 || password.length > 72) {
      return NextResponse.json({ error: "Password must be between 6 and 72 characters" }, { status: 400 });
    }
    const sponsor = (await db.getUsers()).find(
      (user) => normalizeReferralCode(user.referralCode) === referral
    );
    if (!sponsor) {
      return NextResponse.json({ error: "Invalid referral code. Please check with your sponsor or upline." }, { status: 400 });
    }
    if (await db.findUserByEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    if (await db.findUserByEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }
    const userId = "usr_" + randomBytes(12).toString("hex");
    let referralCode = "";
    do {
      referralCode = "TF" + randomBytes(5).toString("hex").toUpperCase();
    } while ((await db.getUsers()).some((user) => user.referralCode === referralCode));

    const newUser = await db.createUser({
      id: userId,
      email: normalizedEmail,
      name: normalizedName,
      passwordHash,
      role: "USER",
      referralCode,
      referredBy: referral || undefined,
      createdAt: new Date().toISOString(),
    });

    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        referralCode: newUser.referralCode,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "DUPLICATE_EMAIL") {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

