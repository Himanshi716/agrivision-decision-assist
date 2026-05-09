import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ScanLine, ThumbsDown, ThumbsUp, GitCompare } from "lucide-react";
import { getHistory, addFeedback } from "@/lib/storage";
import type { AnalysisResult } from "@/lib/analysis";
import { VerdictBadge } from "@/components/VerdictBadge";

export const Route = createFileRoute("/result/$id")({
  component: ResultPage,
});

function ResultPage() {
  const { id } = Route.useParams();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const h = getHistory().find((r) => r.id === id);
    setResult(h ?? null);
  }, [id]);

  if (!result) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-muted-foreground">Result not found.</p>
        <Link to="/scan" className="inline-flex items-center gap-2 text-primary">
          <ScanLine className="h-4 w-4" /> Start a new scan
        </Link>
      </div>
    );
  }

  function recordFeedback(helpful: boolean) {
    if (!result) return;
    setFeedback(helpful ? "up" : "down");
    addFeedback({ resultId: result.id, helpful });
  }

  const ringTone =
    result.verdict === "Best Pick"
      ? "var(--success)"
      : result.verdict === "Use Soon"
        ? "var(--warning)"
        : "var(--destructive)";

  return (
    <div className="space-y-5">
      <Link to="/scan" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to scan
      </Link>

      <div
        className="rounded-3xl overflow-hidden border border-border bg-card"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="aspect-video w-full bg-muted relative">
          {result.imageDataUrl ? (
            <img src={result.imageDataUrl} alt={result.itemType} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full grid place-items-center text-7xl">🍌</div>
          )}
          <div className="absolute top-3 left-3">
            <VerdictBadge verdict={result.verdict} size="lg" />
          </div>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Detected</div>
              <div className="text-xl font-semibold">{result.itemType}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{result.ripenessStage}</div>
            </div>
            <div className="relative h-20 w-20">
              <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="var(--muted)" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="15"
                  fill="none"
                  stroke={ringTone}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${(result.score / 10) * 94.2} 94.2`}
                />
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <div className="text-center leading-none">
                  <div className="text-lg font-semibold">{result.score}</div>
                  <div className="text-[10px] text-muted-foreground">/ 10</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            Confidence {result.confidence}%
          </div>

          <div className="rounded-xl bg-muted/60 p-3 text-sm">
            <div className="font-medium mb-1">Why</div>
            <p className="text-muted-foreground">{result.reason}</p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
            <div className="font-medium text-primary mb-1">Recommendation</div>
            <p>{result.recommendation}</p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="font-medium mb-3">Detected traits</h3>
        <div className="grid grid-cols-2 gap-2">
          {result.traits.map((t) => {
            const cls =
              t.tone === "good"
                ? "border-success/30 bg-success/10"
                : t.tone === "warn"
                  ? "border-warning/40 bg-warning/10"
                  : "border-destructive/30 bg-destructive/10";
            return (
              <div key={t.label} className={`rounded-xl border ${cls} px-3 py-2`}>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.label}</div>
                <div className="text-sm font-medium">{t.value}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="flex items-center justify-between rounded-2xl border border-border bg-card p-4">
        <span className="text-sm text-muted-foreground">Was this helpful?</span>
        <div className="flex gap-2">
          <button
            onClick={() => recordFeedback(true)}
            className={`h-9 w-9 grid place-items-center rounded-full border transition ${
              feedback === "up" ? "bg-success/15 border-success/40 text-success" : "border-border hover:bg-accent/40"
            }`}
          >
            <ThumbsUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => recordFeedback(false)}
            className={`h-9 w-9 grid place-items-center rounded-full border transition ${
              feedback === "down" ? "bg-destructive/15 border-destructive/40 text-destructive" : "border-border hover:bg-accent/40"
            }`}
          >
            <ThumbsDown className="h-4 w-4" />
          </button>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/scan"
          className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-card py-3 hover:border-primary/40 transition"
        >
          <ScanLine className="h-4 w-4" /> Scan another
        </Link>
        <Link
          to="/compare"
          className="flex items-center justify-center gap-2 rounded-2xl text-primary-foreground py-3"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          <GitCompare className="h-4 w-4" /> Compare items
        </Link>
      </div>
    </div>
  );
}