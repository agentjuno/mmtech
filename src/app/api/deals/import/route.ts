import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { matchDeal } from "@/lib/matching";

const VALID_STATUSES = ["sourcing", "evaluating", "listed", "matched", "in_progress", "completed", "cancelled"];
const VALID_CATEGORIES = ["SaaS", "Domain", "Content", "E-commerce", "Newsletter", "Other"];

export interface ImportRow {
  title: string;
  category?: string;
  askingPrice?: string;
  estimatedValue?: string;
  sourceUrl?: string;
  description?: string;
  status?: string;
}

export interface ImportRowResult extends ImportRow {
  rowIndex: number;
  errors: string[];
  valid: boolean;
}

export function validateRow(row: ImportRow, index: number): ImportRowResult {
  const errors: string[] = [];

  if (!row.title?.trim()) {
    errors.push("Title is required");
  }

  if (row.askingPrice && isNaN(parseFloat(row.askingPrice))) {
    errors.push("Asking price must be a number");
  }

  if (row.estimatedValue && isNaN(parseFloat(row.estimatedValue))) {
    errors.push("Estimated value must be a number");
  }

  if (row.status && !VALID_STATUSES.includes(row.status)) {
    errors.push(`Status must be one of: ${VALID_STATUSES.join(", ")}`);
  }

  if (row.category && !VALID_CATEGORIES.includes(row.category)) {
    errors.push(`Category must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  if (row.sourceUrl) {
    try {
      new URL(row.sourceUrl);
    } catch {
      errors.push("Source URL must be a valid URL");
    }
  }

  return { ...row, rowIndex: index, errors, valid: errors.length === 0 };
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const rows: ImportRow[] = body.rows;

  if (!Array.isArray(rows) || rows.length === 0) {
    return NextResponse.json({ error: "No rows provided" }, { status: 400 });
  }

  if (rows.length > 500) {
    return NextResponse.json({ error: "Maximum 500 rows per import" }, { status: 400 });
  }

  const validRows = rows.filter((r) => validateRow(r, 0).valid);

  if (validRows.length === 0) {
    return NextResponse.json({ error: "No valid rows to import" }, { status: 400 });
  }

  const inserted = await db
    .insert(deals)
    .values(
      validRows.map((row) => ({
        userId,
        title: row.title.trim(),
        category: row.category?.trim() || null,
        askingPrice: row.askingPrice?.trim() || null,
        estimatedValue: row.estimatedValue?.trim() || null,
        sourceUrl: row.sourceUrl?.trim() || null,
        description: row.description?.trim() || null,
        status:
          (row.status?.trim() as typeof deals.$inferSelect.status) ?? "sourcing",
      }))
    )
    .returning({ id: deals.id });

  // Run matching for each imported deal (non-blocking)
  for (const deal of inserted) {
    matchDeal(deal.id).catch(() => {});
  }

  return NextResponse.json({ imported: inserted.length });
}
