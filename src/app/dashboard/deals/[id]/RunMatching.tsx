"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RunMatching({ dealId }: { dealId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleMatch() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`/api/deals/${dealId}/match`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult(
          data.matched > 0
            ? `${data.matched} new match${data.matched === 1 ? "" : "es"} found.`
            : "No new matches found."
        );
        router.refresh();
      } else {
        setResult("Matching failed.");
      }
    } catch {
      setResult("Matching failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleMatch}
        disabled={loading}
        className="text-xs px-3 py-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Matching…" : "Run matching"}
      </button>
      {result && (
        <span className="text-xs text-muted-foreground">{result}</span>
      )}
    </div>
  );
}
