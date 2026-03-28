import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { matchDeal } from "@/lib/matching";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [deal] = await db
    .select({ id: deals.id })
    .from(deals)
    .where(eq(deals.id, id));

  if (!deal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const created = await matchDeal(id);
  return NextResponse.json({ matched: created });
}
