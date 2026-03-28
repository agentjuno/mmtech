import Link from "next/link";
import { sql, count } from "drizzle-orm";
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

const STATUS_BAR_COLORS: Record<string, string> = {
  sourcing: "bg-blue-500",
  evaluating: "bg-yellow-500",
  listed: "bg-purple-500",
  matched: "bg-green-500",
  in_progress: "bg-orange-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-400",
};

const STATUS_TEXT_COLORS: Record<string, string> = {
  sourcing: "text-blue-600",
  evaluating: "text-yellow-600",
  listed: "text-purple-600",
  matched: "text-green-600",
  in_progress: "text-orange-600",
  completed: "text-emerald-600",
  cancelled: "text-red-500",
};

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export default async function DashboardPage() {
  const [aggregates, statusBreakdown, oppCount] = await Promise.all([
    db
      .select({
        activeDeals: sql<number>`cast(count(*) filter (where status not in ('cancelled', 'completed')) as int)`,
        closedDeals: sql<number>`cast(count(*) filter (where status = 'completed') as int)`,
        totalDeals: sql<number>`cast(count(*) as int)`,
        totalValueDelta: sql<number>`coalesce(sum(cast(estimated_value as numeric) - cast(asking_price as numeric)) filter (where estimated_value is not null and asking_price is not null), 0)`,
        avgMarginPct: sql<number>`coalesce(avg((cast(estimated_value as numeric) - cast(asking_price as numeric)) / nullif(cast(estimated_value as numeric), 0) * 100) filter (where estimated_value is not null and asking_price is not null), 0)`,
      })
      .from(deals),
    db
      .select({
        status: deals.status,
        cnt: sql<number>`cast(count(*) as int)`,
      })
      .from(deals)
      .groupBy(deals.status),
    db.select({ cnt: sql<number>`cast(count(*) as int)` }).from(opportunities),
  ]);

  const agg = aggregates[0];
  const totalOpps = oppCount[0]?.cnt ?? 0;
  const totalDeals = agg.totalDeals ?? 0;

  const stats = [
    { label: "Active Deals", value: String(agg.activeDeals ?? 0), sub: "in pipeline" },
    { label: "Opportunities", value: String(totalOpps), sub: "linked to deals" },
    {
      label: "Avg Margin",
      value: agg.avgMarginPct ? `${Number(agg.avgMarginPct).toFixed(1)}%` : "—",
      sub: "across all deals",
    },
    { label: "Closed Deals", value: String(agg.closedDeals ?? 0), sub: "completed" },
  ];

  const statusOrder = ["sourcing", "evaluating", "listed", "matched", "in_progress", "completed", "cancelled"];
  const breakdownMap = Object.fromEntries(statusBreakdown.map((r) => [r.status, r.cnt]));

  return (
    <div className="px-8 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Your digital arbitrage pipeline
          </p>
        </div>
        <Link
          href="/dashboard/deals/new"
          className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          + New deal
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-border bg-card p-5 space-y-2"
          >
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-2xl font-semibold font-mono">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Status distribution */}
      {totalDeals > 0 && (
        <div className="rounded-lg border border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Deal pipeline</p>
            <p className="text-xs text-muted-foreground">{totalDeals} total</p>
          </div>

          {/* Stacked bar */}
          <div className="flex h-3 rounded-full overflow-hidden gap-px bg-secondary">
            {statusOrder.map((s) => {
              const cnt = breakdownMap[s] ?? 0;
              if (cnt === 0) return null;
              const pct = (cnt / totalDeals) * 100;
              return (
                <div
                  key={s}
                  className={`${STATUS_BAR_COLORS[s] ?? "bg-secondary"} transition-all`}
                  style={{ width: `${pct}%` }}
                  title={`${STATUS_LABELS[s]}: ${cnt}`}
                />
              );
            })}
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {statusOrder.map((s) => {
              const cnt = breakdownMap[s] ?? 0;
              if (cnt === 0) return null;
              const pct = ((cnt / totalDeals) * 100).toFixed(0);
              return (
                <Link
                  key={s}
                  href={`/dashboard/deals?status=${s}`}
                  className="flex items-center gap-2 group"
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${STATUS_BAR_COLORS[s] ?? "bg-secondary"}`} />
                  <span className={`text-xs ${STATUS_TEXT_COLORS[s] ?? "text-muted-foreground"}`}>
                    {STATUS_LABELS[s]}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {cnt} <span className="text-muted-foreground/60">({pct}%)</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state or recent deals link */}
      {totalDeals === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="text-4xl font-mono text-muted-foreground">⇌</div>
          <div>
            <h3 className="font-semibold">No deals yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add your first deal to start building the pipeline.
            </p>
          </div>
          <Link
            href="/dashboard/deals/new"
            className="text-sm text-primary hover:underline"
          >
            Submit a deal →
          </Link>
        </div>
      ) : (
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Total potential upside:{" "}
            <span className="font-mono font-medium text-foreground">
              {formatCurrency(Number(agg.totalValueDelta))}
            </span>
          </p>
          <Link href="/dashboard/deals" className="text-primary hover:underline">
            View all deals →
          </Link>
        </div>
      )}
    </div>
  );
}
