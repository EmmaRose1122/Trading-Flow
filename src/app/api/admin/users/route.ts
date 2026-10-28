import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSession, hashPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { parseMoney, roundMoney } from "@/lib/money";
import { PLATFORM_REFERRAL_CODE, normalizeReferralCode } from "@/lib/referral";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const admin = session ? db.findUserById(session.userId) : null;
    if (!admin || admin.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { name, email, password, role = "USER", referredBy, initialBalance = 0, note } = await req.json();

    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "A valid user name is required" }, { status: 400 });
    }
    if (typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email.trim().toLowerCase())) {
      return NextResponse.json({ error: "A valid email address is required" }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 6 || password.length > 72) {
      return NextResponse.json({ error: "Password must be between 6 and 72 characters" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = name.trim();
    const assignedRole: "USER" | "ADMIN" = role === "ADMIN" ? "ADMIN" : "USER";

    if (db.findUserByEmail(normalizedEmail)) {
      return NextResponse.json({ error: "Email is already registered" }, { status: 409 });
    }

    // Empty sponsor defaults to the platform admin code so every account has a valid upline.
    let validReferral: string = PLATFORM_REFERRAL_CODE;
    if (typeof referredBy === "string" && referredBy.trim()) {
      const code = normalizeReferralCode(referredBy);
      const sponsor = db
        .getUsers()
        .find((u) => normalizeReferralCode(u.referralCode) === code);
      if (!sponsor) {
        return NextResponse.json({ error: `Sponsor with referral code "${code}" does not exist` }, { status: 400 });
      }
      validReferral = code;
    }

    // Initial Balance (Free balance added by admin)
    let balanceToAdd = 0;
    if (initialBalance !== undefined && initialBalance !== null && initialBalance !== "") {
      const parsed = parseMoney(initialBalance);
      if (parsed === null || parsed < 0) {
        return NextResponse.json({ error: "Initial balance must be a valid non-negative number" }, { status: 400 });
      }
      balanceToAdd = parsed;
    }

    const passwordHash = await hashPassword(password);
    const userId = "usr_" + randomBytes(12).toString("hex");

    let referralCode = "";
    do {
      referralCode = "TF" + randomBytes(5).toString("hex").toUpperCase();
    } while (db.getUsers().some((u) => u.referralCode === referralCode));

    const newUser = db.createUser(
      {
        id: userId,
        email: normalizedEmail,
        name: normalizedName,
        passwordHash,
        role: assignedRole,
        referralCode,
        referredBy: validReferral,
        createdAt: new Date().toISOString(),
      },
      balanceToAdd
    );

    // If initial balance was granted, record transaction
    if (balanceToAdd > 0) {
      db.createTransaction({
        id: "TX-BONUS-" + Math.floor(100000 + Math.random() * 900000),
        userId: newUser.id,
        userEmail: newUser.email,
        userName: newUser.name,
        type: "BONUS",
        amount: balanceToAdd,
        fee: 0,
        status: "SUCCESS",
        method: "Admin Free Account Credit",
        note: (typeof note === "string" && note.trim()) ? note.trim() : "Admin Welcome Free Balance Credit",
        adminId: admin.id,
        previousBalance: 0,
        newBalance: balanceToAdd,
        createdAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Account created successfully with ${validReferral ? "sponsor " + validReferral : "Direct Upline"}!`,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        referralCode: newUser.referralCode,
        referredBy: newUser.referredBy || null,
        initialBalance: balanceToAdd,
      },
    });
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

