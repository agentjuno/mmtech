import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { opportunities, deals } from "@/lib/db/schema";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function OpportunitiesPage() {
  const rows = await db
    .select({
      id: opportunities.id,
      buyerInfo: opportunities.buyerInfo,
      margin: opportunities.margin,
      notes: opportunities.notes,
      createdAt: opportunities.createdAt,
      dealId: deals.id,
      dealTitle: deals.title,
      dealStatus: deals.status,
    })
    .from(opportunities)
    .innerJoin(deals, eq(deals.id, opportunities.dealId))
    .orderBy(desc(opportunities.createdAt));

  return (
    <div className="px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Matched buyers and open brokerage opportunities
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 flex flex-col items-center justify-center text-center space-y-3">
          <div className="text-4xl font-mono text-muted-foreground">◈</div>
          <div>
            <h3 className="font-semibold">No opportunities yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Opportunities are generated when deals are listed and matched to buyers.
            </p>
          </div>
          <Link
            href="/dashboard/deals"
            className="text-sm text-primary hover:underline"
          >
            View deals →
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  Buyer
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  Deal
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  Margin
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  Notes
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">
                  Added
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium">{row.buyerInfo ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/deals/${row.dealId}`}
                      className="text-primary hover:underline truncate max-w-[200px] block"
                    >
                      {row.dealTitle}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {row.margin ? (
                      <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                        {parseFloat(row.margin).toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground max-w-[240px]">
                    <span className="line-clamp-1">{row.notes ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {formatDate(row.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
