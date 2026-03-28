"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { ImportRow, ImportRowResult } from "@/app/api/deals/import/route";

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const FIELD_MAP: Record<string, keyof ImportRow> = {
    title: "title",
    name: "title",
    category: "category",
    "asking price": "askingPrice",
    askingprice: "askingPrice",
    asking_price: "askingPrice",
    "estimated value": "estimatedValue",
    estimatedvalue: "estimatedValue",
    estimated_value: "estimatedValue",
    "source url": "sourceUrl",
    sourceurl: "sourceUrl",
    source_url: "sourceUrl",
    url: "sourceUrl",
    description: "description",
    notes: "description",
    status: "status",
  };

  const mappedHeaders = headers.map((h) => FIELD_MAP[h.toLowerCase()] ?? null);

  return lines.slice(1).map((line) => {
    const values = parseCSVLine(line);
    const row: ImportRow = { title: "" };
    mappedHeaders.forEach((field, i) => {
      if (field && values[i] !== undefined) {
        (row as unknown as Record<string, string>)[field] = values[i].trim();
      }
    });
    return row;
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function validateRow(row: ImportRow, index: number): ImportRowResult {
  const VALID_STATUSES = ["sourcing", "evaluating", "listed", "matched", "in_progress", "completed", "cancelled"];
  const VALID_CATEGORIES = ["SaaS", "Domain", "Content", "E-commerce", "Newsletter", "Other"];
  const errors: string[] = [];

  if (!row.title?.trim()) errors.push("Title required");
  if (row.askingPrice && isNaN(parseFloat(row.askingPrice))) errors.push("Invalid asking price");
  if (row.estimatedValue && isNaN(parseFloat(row.estimatedValue))) errors.push("Invalid est. value");
  if (row.status && !VALID_STATUSES.includes(row.status)) errors.push(`Invalid status`);
  if (row.category && !VALID_CATEGORIES.includes(row.category)) errors.push(`Invalid category`);
  if (row.sourceUrl) {
    try { new URL(row.sourceUrl); } catch { errors.push("Invalid URL"); }
  }

  return { ...row, rowIndex: index, errors, valid: errors.length === 0 };
}

export default function ImportPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ImportRowResult[]>([]);
  const [importing, setImporting] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      const validated = parsed.map((row, i) => validateRow(row, i + 1));
      setRows(validated);
      setDone(null);
      setError(null);
    };
    reader.readAsText(file);
  }

  async function handleImport() {
    const validRows = rows.filter((r) => r.valid);
    if (validRows.length === 0) return;
    setImporting(true);
    setError(null);
    try {
      const res = await fetch("/api/deals/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: validRows }),
      });
      const data = await res.json();
      if (res.ok) {
        setDone(data.imported);
        setRows([]);
        if (fileRef.current) fileRef.current.value = "";
      } else {
        setError(data.error ?? "Import failed");
      }
    } catch {
      setError("Import failed");
    } finally {
      setImporting(false);
    }
  }

  const validCount = rows.filter((r) => r.valid).length;
  const errorCount = rows.length - validCount;

  return (
    <div className="px-8 py-8 max-w-4xl space-y-6">
      <div>
        <Link
          href="/dashboard/deals"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Deals
        </Link>
        <h1 className="text-xl font-semibold mt-3">Bulk import deals</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Upload a CSV to import multiple deals at once.
        </p>
      </div>

      {/* Format guide */}
      <div className="rounded-lg border border-border p-4 space-y-2 text-sm">
        <p className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
          Expected CSV columns
        </p>
        <p className="text-muted-foreground font-mono text-xs">
          title, category, askingPrice, estimatedValue, sourceUrl, description, status
        </p>
        <p className="text-xs text-muted-foreground">
          Only <strong>title</strong> is required. Category must be one of: SaaS, Domain, Content,
          E-commerce, Newsletter, Other. Status defaults to <code>sourcing</code>.
        </p>
        <a
          href={`data:text/csv;charset=utf-8,${encodeURIComponent(
            "title,category,askingPrice,estimatedValue,sourceUrl,description,status\n" +
            "Example SaaS Tool,SaaS,50000,65000,https://example.com,A great tool,evaluating\n"
          )}`}
          download="deals-template.csv"
          className="text-xs text-primary hover:underline"
        >
          Download template →
        </a>
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium mb-1.5">CSV file</label>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFile}
          className="text-sm text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-border file:text-xs file:text-foreground file:bg-secondary hover:file:bg-secondary/80 file:cursor-pointer"
        />
      </div>

      {done !== null && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-500/10 p-4 text-sm text-emerald-600">
          Successfully imported {done} deal{done === 1 ? "" : "s"}.{" "}
          <button
            onClick={() => router.push("/dashboard/deals")}
            className="underline hover:no-underline"
          >
            View deals →
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {/* Preview */}
      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm">
              <span>
                {rows.length} row{rows.length === 1 ? "" : "s"} parsed
              </span>
              {validCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">
                  {validCount} valid
                </span>
              )}
              {errorCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-500">
                  {errorCount} with errors
                </span>
              )}
            </div>
            <button
              onClick={handleImport}
              disabled={importing || validCount === 0}
              className="text-sm px-4 py-2 rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? "Importing…" : `Import ${validCount} valid deal${validCount === 1 ? "" : "s"}`}
            </button>
          </div>

          <div className="rounded-lg border border-border overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">#</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Title</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Category</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Asking</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Est. Value</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left px-3 py-2 text-muted-foreground font-medium">Validation</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.rowIndex}
                    className={`border-b border-border last:border-0 ${
                      row.valid ? "" : "bg-red-500/5"
                    }`}
                  >
                    <td className="px-3 py-2 text-muted-foreground">{row.rowIndex}</td>
                    <td className="px-3 py-2 font-medium max-w-[200px] truncate">
                      {row.title || <span className="text-red-500">—</span>}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{row.category || "—"}</td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {row.askingPrice ? `$${parseFloat(row.askingPrice).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-3 py-2 font-mono text-muted-foreground">
                      {row.estimatedValue ? `$${parseFloat(row.estimatedValue).toLocaleString()}` : "—"}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{row.status || "sourcing"}</td>
                    <td className="px-3 py-2">
                      {row.valid ? (
                        <span className="text-emerald-600">✓</span>
                      ) : (
                        <span className="text-red-500">{row.errors.join(", ")}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
