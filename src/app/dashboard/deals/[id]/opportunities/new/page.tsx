import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { deals } from "@/lib/db/schema";
import { createOpportunity } from "@/app/actions/opportunities";

export default async function NewOpportunityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [deal] = await db.select().from(deals).where(eq(deals.id, id));

  if (!deal) notFound();

  async function handleCreate(formData: FormData) {
    "use server";
    await createOpportunity(id, formData);
  }

  return (
    <div className="px-8 py-8 max-w-lg space-y-6">
      <div>
        <Link
          href={`/dashboard/deals/${id}`}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← {deal.title}
        </Link>
        <h1 className="text-xl font-semibold mt-3">Add opportunity</h1>
      </div>

      <form action={handleCreate} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="buyerInfo">
            Buyer info
          </label>
          <textarea
            id="buyerInfo"
            name="buyerInfo"
            rows={3}
            placeholder="Describe the buyer or lead..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="margin">
            Margin (%)
          </label>
          <input
            id="margin"
            name="margin"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="e.g. 15.00"
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            placeholder="Additional notes about this opportunity..."
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            Add opportunity
          </button>
          <Link
            href={`/dashboard/deals/${id}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
