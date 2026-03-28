import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold tracking-tight">Midway</span>
          <span className="text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5 font-mono">
            beta
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard"
            className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <div className="max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-full px-3 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Digital arbitrage, automated
          </div>

          <h1 className="text-5xl font-bold tracking-tight leading-tight">
            Find the spread.
            <br />
            <span className="text-primary">Close the deal.</span>
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            Midway surfaces digital arbitrage opportunities — products, domains,
            businesses, and content — and brokers the gap between source and
            buyer.
          </p>

          <div className="flex items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard"
              className="bg-primary text-primary-foreground px-6 py-2.5 rounded-md font-medium hover:opacity-90 transition-opacity"
            >
              View deals
            </Link>
            <Link
              href="/dashboard/deals/new"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Submit a deal →
            </Link>
          </div>
        </div>
      </section>

      {/* Feature grid */}
      <section className="border-t border-border px-6 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Source",
              description:
                "Identify undervalued digital assets, domains, SaaS products, and content deals.",
              icon: "⟲",
            },
            {
              title: "Evaluate",
              description:
                "AI-assisted valuation and margin analysis to filter deals worth pursuing.",
              icon: "◈",
            },
            {
              title: "Broker",
              description:
                "Match vetted deals to qualified buyers. Close the spread, keep the margin.",
              icon: "⇌",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-6 space-y-3"
            >
              <div className="text-2xl font-mono text-primary">
                {feature.icon}
              </div>
              <h3 className="font-semibold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        Midway © {new Date().getFullYear()}
      </footer>
    </main>
  );
}
