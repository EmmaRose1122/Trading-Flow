import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db, type KycDetails } from "@/lib/db";

const DOCUMENT_TYPES = ["PASSPORT", "DRIVING_LICENCE", "NATIONAL_ID"];

function ageFromDate(dateOfBirth: string) {
  const dob = new Date(`${dateOfBirth}T00:00:00Z`);
  if (Number.isNaN(dob.getTime())) return -1;
  const now = new Date();
  let age = now.getUTCFullYear() - dob.getUTCFullYear();
  const monthDiff = now.getUTCMonth() - dob.getUTCMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getUTCDate() < dob.getUTCDate())) age -= 1;
  return age;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = db.findUserById(session.userId);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    status: user.kycStatus || "NOT_STARTED",
    details: user.kycDetails || null,
  });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = db.findUserById(session.userId);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (user.kycStatus === "APPROVED" || user.kycStatus === "PENDING") {
      return NextResponse.json({ error: "A KYC application is already active" }, { status: 409 });
    }

    const body = (await request.json()) as Record<string, unknown>;
    const legalName = typeof body.legalName === "string" ? body.legalName.trim() : "";
    const dateOfBirth = typeof body.dateOfBirth === "string" ? body.dateOfBirth.trim() : "";
    const country = typeof body.country === "string" ? body.country.trim() : "";
    const address = typeof body.address === "string" ? body.address.trim() : "";
    const documentType = typeof body.documentType === "string" ? body.documentType : "";
    const documentReference =
      typeof body.documentReference === "string" ? body.documentReference.trim() : "";

    if (
      legalName.length < 2 ||
      legalName.length > 120 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth) ||
      country.length < 2 ||
      country.length > 56 ||
      address.length < 10 ||
      address.length > 240 ||
      !DOCUMENT_TYPES.includes(documentType) ||
      documentReference.length < 4 ||
      documentReference.length > 40
    ) {
      return NextResponse.json({ error: "Please complete all KYC fields correctly" }, { status: 400 });
    }
    if (ageFromDate(dateOfBirth) < 18) {
      return NextResponse.json({ error: "You must be at least 18 years old" }, { status: 400 });
    }

    const details: KycDetails = {
      legalName,
      dateOfBirth,
      country,
      address,
      documentType,
      documentReference,
      submittedAt: new Date().toISOString(),
    };
    db.updateUserSecurity(user.id, { kycStatus: "PENDING", kycDetails: details });
    return NextResponse.json({ success: true, status: "PENDING", details });
  } catch (error) {
    console.error("KYC submission error:", error);
    return NextResponse.json({ error: "Unable to submit KYC application" }, { status: 500 });
  }
}
