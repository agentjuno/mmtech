import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deals, opportunities } from "@/lib/db/schema";
import { deleteDeal } from "@/app/actions/deals";
import { deleteOpportunity } from "@/app/actions/opportunities";
import { AnalyzeDeal } from "./AnalyzeDeal";
import { RunMatching } from "./RunMatching";

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
  return "$" + parseFloat(value).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date: Date) {
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default async function DealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId } = await auth();

  const dealCondition = userId
    ? and(eq(deals.id, id), eq(deals.userId, userId))
    : eq(deals.id, id);

  const [[deal], opps] = await Promise.all([
    db.select().from(deals).where(dealCondition),
    db.select().from(opportunities).where(eq(opportunities.dealId, id)),
  ]);

  if (!deal) notFound();

  const margin =
    deal.askingPrice && deal.estimatedValue
      ? ((parseFloat(deal.estimatedValue) - parseFloat(deal.askingPrice)) /
          parseFloat(deal.estimatedValue)) *
        100
      : null;

  async function handleDelete() {
    "use server";
    await deleteDeal(id);
  }

  return (
    <div className="px-8 py-8 max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard/deals"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Deals
          </Link>
          <h1 className="text-xl font-semibold mt-3">{deal.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[deal.status] ?? "bg-secondary text-muted-foreground"}`}
            >
              {STATUS_LABELS[deal.status] ?? deal.status}
            </span>
            {deal.category && (
              <span className="text-xs text-muted-foreground">{deal.category}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-6">
          <Link
            href={`/dashboard/deals/${deal.id}/edit`}
            className="text-sm px-4 py-2 rounded-md border border-border hover:bg-secondary/50 transition-colors"
          >
            Edit
          </Link>
          <form action={handleDelete}>
            <button
              type="submit"
              className="text-sm px-4 py-2 rounded-md text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Financials */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Asking Price</p>
          <p className="text-lg font-mono font-semibold mt-1">
            {formatCurrency(deal.askingPrice)}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Est. Value</p>
          <p className="text-lg font-mono font-semibold mt-1">
            {formatCurrency(deal.estimatedValue)}
          </p>
        </div>
        <div className="rounded-lg border border-border p-4">
          <p className="text-xs text-muted-foreground">Margin</p>
          <p className="text-lg font-mono font-semibold mt-1">
            {margin !== null ? `${margin.toFixed(1)}%` : "—"}
          </p>
        </div>
      </div>

      {/* Description */}
      {deal.description && (
        <div className="rounded-lg border border-border p-4 space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Description
          </p>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{deal.description}</p>
        </div>
      )}

      {/* Meta */}
      <div className="rounded-lg border border-border p-4 space-y-3">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Details
        </p>
        <dl className="space-y-2 text-sm">
          {deal.sourceUrl && (
            <div className="flex gap-4">
              <dt className="text-muted-foreground w-28 shrink-0">Source URL</dt>
              <dd>
                <a
                  href={deal.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-mono text-xs break-all"
                >
                  {deal.sourceUrl}
                </a>
              </dd>
            </div>
          )}
          <div className="flex gap-4">
            <dt className="text-muted-foreground w-28 shrink-0">Created</dt>
            <dd>{formatDate(deal.createdAt)}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="text-muted-foreground w-28 shrink-0">Updated</dt>
            <dd>{formatDate(deal.updatedAt)}</dd>
          </div>
        </dl>
      </div>

      {/* AI Analysis */}
      <AnalyzeDeal dealId={deal.id} />

      {/* Opportunities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Opportunities ({opps.length})
          </p>
          <div className="flex items-center gap-3">
            <RunMatching dealId={deal.id} />
            <Link
              href={`/dashboard/deals/${deal.id}/opportunities/new`}
              className="text-xs text-primary hover:underline"
            >
              + Add
            </Link>
          </div>
        </div>

        {opps.length === 0 ? (
          <div className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
            No opportunities linked to this deal.{" "}
            <Link
              href={`/dashboard/deals/${deal.id}/opportunities/new`}
              className="text-primary hover:underline"
            >
              Add one →
            </Link>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden divide-y divide-border">
            {opps.map((opp) => {
              async function handleDeleteOpp() {
                "use server";
                await deleteOpportunity(opp.id, id);
              }

              return (
                <div key={opp.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      {opp.buyerInfo && (
                        <p className="text-sm font-medium truncate">{opp.buyerInfo}</p>
                      )}
                      {opp.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{opp.notes}</p>
                      )}
                      <div className="flex items-center gap-3">
                        {opp.margin && (
                          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                            {parseFloat(opp.margin).toFixed(1)}% margin
                          </span>
                        )}
                        {opp.matchScore !== null && opp.matchScore !== undefined && (
                          <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded-full text-muted-foreground">
                            {opp.matchScore}% match
                          </span>
                        )}
                        {opp.source === "auto_matched" && (
                          <span className="text-xs text-muted-foreground/60">auto</span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDate(opp.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/dashboard/deals/${deal.id}/opportunities/${opp.id}/edit`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        Edit
                      </Link>
                      <form action={handleDeleteOpp}>
                        <button
                          type="submit"
                          className="text-xs text-red-500 hover:text-red-600 transition-colors"
                        >
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
