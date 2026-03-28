import Link from "next/link";

export default function DealsPage() {
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
