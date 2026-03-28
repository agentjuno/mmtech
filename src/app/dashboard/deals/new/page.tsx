import Link from "next/link";
import { createDeal } from "@/app/actions/deals";

export default function NewDealPage() {
  return (
    <div className="px-8 py-8 max-w-xl space-y-6">
      <div>
        <Link
          href="/dashboard/deals"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Deals
        </Link>
        <h1 className="text-xl font-semibold mt-3">Submit a deal</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add a new arbitrage opportunity to the pipeline.
        </p>
      </div>

      <form action={createDeal} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            placeholder="e.g. SaaS tool with 500 users, no owner"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="category">
            Category
          </label>
          <select
            id="category"
            name="category"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select a category</option>
            <option value="saas">SaaS / Software</option>
            <option value="domain">Domain / Brand</option>
            <option value="content">Content / Media</option>
            <option value="ecommerce">E-commerce</option>
            <option value="newsletter">Newsletter / Audience</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="askingPrice">
              Asking price ($)
            </label>
            <input
              id="askingPrice"
              name="askingPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="estimatedValue">
              Est. value ($)
            </label>
            <input
              id="estimatedValue"
              name="estimatedValue"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="sourceUrl">
            Source URL
          </label>
          <input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            placeholder="https://..."
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            placeholder="What makes this a good arbitrage opportunity?"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Submit deal
          </button>
          <Link
            href="/dashboard/deals"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
