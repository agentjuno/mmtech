import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  const rows = await db
    .select()
    .from(deals)
    .orderBy(desc(deals.createdAt))
    .limit(50);

  return NextResponse.json(rows);
}
