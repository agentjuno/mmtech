import Link from "next/link";
import { and, desc, eq, ilike, lt, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deals, opportunities } from "@/lib/db/schema";

const STATUS_LABELS: Record<string, string> = {
  sourcing: "Sourcing",
  evaluating: "Evaluating",
  listed: "Listed",
  matched: "Matched",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<string, string> = {
  sourcing: "bg-blue-500/10 text-blue-600",
  evaluating: "bg-yellow-500/10 text-yellow-600",
  listed: "bg-purple-500/10 text-purple-600",
  matched: "bg-green-500/10 text-green-600",
  in_progress: "bg-orange-500/10 text-orange-600",
  completed: "bg-emerald-500/10 text-emerald-600",
  cancelled: "bg-red-500/10 text-red-500",
};

const CATEGORIES = ["SaaS", "Domain", "Content", "E-commerce", "Newsletter", "Other"];
const STATUSES = ["sourcing", "evaluating", "listed", "matched", "in_progress", "completed", "cancelled"];

const PAGE_SIZE = 20;

function formatCurrency(value: string | null) {
  if (!value) return "—";
  return "$" + parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function buildUrl(params: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) p.set(k, v);
  }
  const qs = p.toString();
  return `/dashboard/deals${qs ? `?${qs}` : ""}`;
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; category?: string; cursor?: string }>;
}) {
  const { userId } = await auth();
  const { q, status, category, cursor } = await searchParams;

  const conditions = [];
  if (userId) conditions.push(eq(deals.userId, userId));
  if (q) conditions.push(ilike(deals.title, `%${q}%`));
  if (status && STATUSES.includes(status)) {
    conditions.push(eq(deals.status, status as typeof deals.$inferSelect.status));
  }
  if (category && CATEGORIES.includes(category)) {
    conditions.push(eq(deals.category, category));
  }
  if (cursor) {
    conditions.push(lt(deals.createdAt, new Date(cursor)));
  }

  const rows = await db
    .select({
      id: deals.id,
      title: deals.title,
      category: deals.category,
      askingPrice: deals.askingPrice,
      estimatedValue: deals.estimatedValue,
      status: deals.status,
      createdAt: deals.createdAt,
      opportunityCount: sql<number>`cast(count(${opportunities.id}) as int)`,
    })
    .from(deals)
    .leftJoin(opportunities, eq(opportunities.dealId, deals.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .groupBy(deals.id)
    .orderBy(desc(deals.createdAt))
    .limit(PAGE_SIZE + 1);

  const hasMore = rows.length > PAGE_SIZE;
  const pageRows = hasMore ? rows.slice(0, PAGE_SIZE) : rows;
  const nextCursor = hasMore
    ? pageRows[pageRows.length - 1].createdAt.toISOString()
    : null;

  const isFiltered = !!(q || status || category || cursor);

  return (
    <div className="px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Deals</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All sourced and active deals
          </p>
        </div>
        <Link
          href="/dashboard/deals/new"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          + New deal
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="flex items-center gap-2">
        {status && <input type="hidden" name="status" value={status} />}
        {category && <input type="hidden" name="category" value={category} />}
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search deals by title..."
          className="flex-1 max-w-sm rounded-md border border-border bg-background px-3 py-1.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          className="text-sm px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          Search
        </button>
        {isFiltered && (
          <Link
            href="/dashboard/deals"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Clear filters
          </Link>
        )}
      </form>

      {/* Status filter */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={buildUrl({ q, category })}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !status
                ? "bg-secondary text-foreground border-transparent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            All status
          </Link>
          {STATUSES.map((s) => (
            <Link
              key={s}
              href={buildUrl({ q, category, status: s })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                status === s
                  ? "bg-secondary text-foreground border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {STATUS_LABELS[s]}
            </Link>
          ))}
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={buildUrl({ q, status })}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !category
                ? "bg-secondary text-foreground border-transparent"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            }`}
          >
            All categories
          </Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={buildUrl({ q, status, category: c })}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                category === c
                  ? "bg-secondary text-foreground border-transparent"
                  : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {c}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                Deal
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                Category
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                Asking
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                Est. Value
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                Opps
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground text-sm"
                >
                  {isFiltered ? (
                    <>
                      No deals match your filters.{" "}
                      <Link href="/dashboard/deals" className="text-primary hover:underline">
                        Clear filters →
                      </Link>
                    </>
                  ) : (
                    <>
                      No deals yet.{" "}
                      <Link href="/dashboard/deals/new" className="text-primary hover:underline">
                        Add one →
                      </Link>
                    </>
                  )}
                </td>
              </tr>
            ) : (
              pageRows.map((deal) => (
                <tr
                  key={deal.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/deals/${deal.id}`}
                      className="font-medium hover:text-primary transition-colors"
                    >
                      {deal.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {deal.category ?? "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {formatCurrency(deal.askingPrice)}
                  </td>
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {formatCurrency(deal.estimatedValue)}
                  </td>
                  <td className="px-4 py-3">
                    {deal.opportunityCount > 0 ? (
                      <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                        {deal.opportunityCount}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[deal.status] ?? "bg-secondary text-muted-foreground"}`}
                    >
                      {STATUS_LABELS[deal.status] ?? deal.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {(nextCursor || cursor) && (
        <div className="flex items-center justify-between text-sm">
          <div>
            {cursor && (
              <Link
                href={buildUrl({ q, status, category })}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                ← First page
              </Link>
            )}
          </div>
          <div>
            {nextCursor && (
              <Link
                href={buildUrl({ q, status, category, cursor: nextCursor })}
                className="text-primary hover:underline"
              >
                Next page →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
