import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ilike, lt } from "drizzle-orm";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";

const VALID_STATUSES = ["sourcing", "evaluating", "listed", "matched", "in_progress", "completed", "cancelled"];
const VALID_CATEGORIES = ["SaaS", "Domain", "Content", "E-commerce", "Newsletter", "Other"];
const PAGE_SIZE = 50;

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") ?? String(PAGE_SIZE), 10), 100);

  const conditions = [];
  if (q) conditions.push(ilike(deals.title, `%${q}%`));
  if (status && VALID_STATUSES.includes(status)) {
    conditions.push(eq(deals.status, status as typeof deals.$inferSelect.status));
  }
  if (category && VALID_CATEGORIES.includes(category)) {
    conditions.push(eq(deals.category, category));
  }
  if (cursor) {
    const cursorDate = new Date(cursor);
    if (!isNaN(cursorDate.getTime())) {
      conditions.push(lt(deals.createdAt, cursorDate));
    }
  }

  const rows = await db
    .select()
    .from(deals)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(deals.createdAt))
    .limit(limit + 1);

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? data[data.length - 1].createdAt.toISOString() : null;

  return NextResponse.json({ data, nextCursor, hasMore });
}
