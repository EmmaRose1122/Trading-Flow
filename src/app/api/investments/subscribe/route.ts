import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Separate investment subscriptions are disabled. Deposit funds to start earning 2% daily after 24 hours.",
    },
    { status: 410 }
  );
}

