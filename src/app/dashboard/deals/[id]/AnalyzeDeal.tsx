"use client";

import { useState } from "react";

export function AnalyzeDeal({ dealId }: { dealId: string }) {
  const [analysis, setAnalysis] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze() {
    setLoading(true);
    setError(null);
    setAnalysis("");

    try {
      const res = await fetch(`/api/deals/${dealId}/analyze`, { method: "POST" });
      if (!res.ok) {
        setError("Analysis failed. Please try again.");
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) return;

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // Parse Vercel AI SDK data stream format: lines starting with "0:"
        for (const line of chunk.split("\n")) {
          if (line.startsWith("0:")) {
            try {
              const text = JSON.parse(line.slice(2));
              buffer += text;
              setAnalysis(buffer);
            } catch {
              // ignore parse errors
            }
          }
        }
      }
    } catch {
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          AI Analysis
        </p>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing…" : analysis ? "Re-analyze" : "Analyze deal"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {!analysis && !loading && !error && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Click &ldquo;Analyze deal&rdquo; to get an AI-powered assessment of market value,
          pricing strategy, and risk factors.
        </div>
      )}

      {loading && !analysis && (
        <div className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground animate-pulse">
          Analyzing…
        </div>
      )}

      {analysis && (
        <div className="rounded-lg border border-border p-5 prose prose-sm max-w-none text-sm leading-relaxed">
          <MarkdownText text={analysis} />
        </div>
      )}
    </div>
  );
}

function MarkdownText({ text }: { text: string }) {
  // Simple markdown renderer: bold (**text**), headers (## text), newlines
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <p key={i} className="font-semibold text-foreground mt-3 first:mt-0">
              {line.slice(3)}
            </p>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <p key={i} className="font-medium text-foreground mt-2">
              {line.slice(4)}
            </p>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) {
          return (
            <p key={i} className="font-semibold">
              {line.slice(2, -2)}
            </p>
          );
        }
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <p key={i} className="text-muted-foreground pl-3">
              • {renderInline(line.slice(2))}
            </p>
          );
        }
        if (line.trim() === "") {
          return <div key={i} className="h-1" />;
        }
        return (
          <p key={i} className="text-muted-foreground">
            {renderInline(line)}
          </p>
        );
      })}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** inline
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : (
          part
        )
      )}
    </>
  );
}
