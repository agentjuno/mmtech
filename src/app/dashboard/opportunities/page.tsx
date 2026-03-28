export default function OpportunitiesPage() {
  return (
    <div className="px-8 py-8 space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Opportunities</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Matched buyers and open brokerage opportunities
        </p>
      </div>

      <div className="rounded-lg border border-border bg-card p-12 flex flex-col items-center justify-center text-center space-y-3">
        <div className="text-4xl font-mono text-muted-foreground">◈</div>
        <div>
          <h3 className="font-semibold">No opportunities yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Opportunities are generated when deals are listed and matched to buyers.
          </p>
        </div>
      </div>
    </div>
  );
}
