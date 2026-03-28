import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";

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

function formatCurrency(value: string | null) {
  if (!value) return "—";
  return "$" + parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 0 });
}

export default async function DealsPage() {
  const rows = await db.select().from(deals).orderBy(desc(deals.createdAt));

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

      {/* Filter bar */}
      <div className="flex items-center gap-2">
        {["All", "Sourcing", "Evaluating", "Listed", "Matched", "Completed"].map(
          (filter) => (
            <button
              key={filter}
              className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors first:bg-secondary first:text-foreground first:border-transparent"
            >
              {filter}
            </button>
          )
        )}
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
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-muted-foreground text-sm"
                >
                  No deals yet.{" "}
                  <Link href="/dashboard/deals/new" className="text-primary hover:underline">
                    Add one →
                  </Link>
                </td>
              </tr>
            ) : (
              rows.map((deal) => (
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
    </div>
  );
}
