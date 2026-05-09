import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, X, Trophy, Sparkles } from "lucide-react";
import { itemTypes } from "@/lib/learn-content";
import { analyze, compareResults, type AnalysisResult } from "@/lib/analysis";
import { VerdictBadge } from "@/components/VerdictBadge";

export const Route = createFileRoute("/compare")({
  component: ComparePage,
});

function ComparePage() {
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [picker, setPicker] = useState("Banana");

  function addItem() {
    if (items.length >= 3) return;
    setItems((prev) => [...prev, analyze({ itemType: picker })]);
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const outcome = compareResults(items);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Compare</h1>
        <p className="text-sm text-muted-foreground">Add 2–3 items to see the best pick.</p>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={picker}
          onChange={(e) => setPicker(e.target.value)}
          className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm"
        >
          {itemTypes.map((i) => (
            <option key={i.value} value={i.value}>
              {i.emoji} {i.value}
            </option>
          ))}
        </select>
        <button
          onClick={addItem}
          disabled={items.length >= 3}
          className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm text-primary-foreground disabled:opacity-50"
          style={{ backgroundImage: "var(--gradient-primary)" }}
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      </div>

      {items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No items yet. Add an item to compare.
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        {items.map((r) => {
          const isWinner = outcome?.winnerId === r.id;
          return (
            <div
              key={r.id}
              className={`relative rounded-2xl border bg-card p-4 ${isWinner ? "border-primary/50 ring-2 ring-primary/30" : "border-border"}`}
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <button
                onClick={() => remove(r.id)}
                className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full hover:bg-accent/50"
              >
                <X className="h-4 w-4" />
              </button>
              {isWinner && (
                <span className="absolute -top-2 left-3 inline-flex items-center gap-1 text-xs font-medium bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                  <Trophy className="h-3 w-3" /> Winner
                </span>
              )}
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs text-muted-foreground">Item</div>
                  <div className="font-medium">{r.itemType}</div>
                </div>
                <VerdictBadge verdict={r.verdict} size="sm" />
              </div>
              <div className="flex items-baseline gap-1 mt-2">
                <span className="text-3xl font-semibold">{r.score}</span>
                <span className="text-sm text-muted-foreground">/10</span>
                <span className="ml-auto text-xs text-muted-foreground">{r.confidence}% conf.</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{r.reason}</p>
            </div>
          );
        })}
      </div>

      {outcome && (
        <div className="rounded-2xl p-4 text-primary-foreground" style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}>
          <div className="flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4" /> AgriVision recommends
          </div>
          <p className="mt-1 text-sm text-primary-foreground/90">{outcome.rationale}</p>
        </div>
      )}
    </div>
  );
}