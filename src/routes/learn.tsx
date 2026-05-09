import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Lightbulb, AlertTriangle } from "lucide-react";
import { learnTopics, type LearnTopic } from "@/lib/learn-content";

export const Route = createFileRoute("/learn")({
  component: LearnPage,
});

function LearnPage() {
  const [active, setActive] = useState<LearnTopic>(learnTopics[0]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Learn</h1>
        <p className="text-sm text-muted-foreground">Visual cues for ripeness, spoilage, and defects.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1">
        {learnTopics.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm whitespace-nowrap transition ${
              active.id === t.id
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card border-border hover:border-primary/40"
            }`}
          >
            <span>{t.emoji}</span> {t.item}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-3">
          <div className="text-4xl">{active.emoji}</div>
          <div>
            <h2 className="text-lg font-semibold">{active.item}</h2>
            <p className="text-sm text-muted-foreground">{active.summary}</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2 px-1">Ripeness stages</h3>
        <div className="space-y-2">
          {active.stages.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <span className="h-8 w-8 rounded-full" style={{ backgroundColor: s.color }} />
              <div className="flex-1">
                <div className="font-medium text-sm">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-destructive">
          <AlertTriangle className="h-4 w-4" /> Spoilage signs
        </div>
        <ul className="text-sm space-y-1">
          {active.spoilageSigns.map((s) => (
            <li key={s} className="text-muted-foreground">• {s}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-2 text-sm font-medium">
          <Lightbulb className="h-4 w-4 text-primary" /> Tips
        </div>
        <ul className="text-sm space-y-1">
          {active.tips.map((t) => (
            <li key={t} className="text-muted-foreground">• {t}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}