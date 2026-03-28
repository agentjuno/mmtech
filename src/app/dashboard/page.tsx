import Link from "next/link";

const stats = [
  { label: "Active Deals", value: "0", delta: "—" },
  { label: "Opportunities", value: "0", delta: "—" },
  { label: "Total Margin", value: "$0", delta: "—" },
  { label: "Closed Deals", value: "0", delta: "—" },
];

export default function DashboardPage() {
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
            <p className="text-xs text-muted-foreground">{stat.delta}</p>
          </div>
        ))}
      </div>

      {/* Empty state */}
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
    </div>
  );
}
