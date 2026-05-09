import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { ScanLine, Apple, Carrot, GitCompare, BookOpen, History, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

const quick = [
  { to: "/scan", label: "Fruit", icon: Apple, hint: "Banana, apple, mango" },
  { to: "/scan", label: "Vegetable", icon: Carrot, hint: "Tomato, potato, onion" },
  { to: "/compare", label: "Compare", icon: GitCompare, hint: "Pick the best of 2–3" },
  { to: "/learn", label: "Learn", icon: BookOpen, hint: "Ripeness & spoilage" },
  { to: "/history", label: "History", icon: History, hint: "Past scans" },
];

function Index() {
  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 text-primary-foreground"
        style={{ backgroundImage: "var(--gradient-hero)", boxShadow: "var(--shadow-elegant)" }}
      >
        <div className="relative z-10 max-w-md">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/15 backdrop-blur px-2.5 py-1 rounded-full">
            <Sparkles className="h-3 w-3" /> Real-time produce intelligence
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-semibold leading-tight tracking-tight">
            Scan it. Score it. <br /> Decide in seconds.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-primary-foreground/85">
            AgriVision AI looks at your fruit or vegetable and tells you Best Pick, Use Soon, or
            Avoid — with reasons you can trust.
          </p>
          <Link
            to="/scan"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-background text-foreground px-5 py-3 font-medium shadow hover:bg-background/90 transition"
          >
            <ScanLine className="h-4 w-4" /> Start scanning
          </Link>
        </div>
        <div className="absolute -right-8 -bottom-8 text-[180px] opacity-20 select-none">🍌</div>
      </section>

      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">Quick actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {quick.map((q) => {
            const Icon = q.icon;
            return (
              <Link
                key={q.label}
                to={q.to}
                className="group rounded-2xl border border-border bg-card p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary mb-3 group-hover:bg-primary/15">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="font-medium">{q.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{q.hint}</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5" style={{ boxShadow: "var(--shadow-card)" }}>
        <h3 className="font-medium">Why AgriVision?</h3>
        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
          <li>• Instant verdict with score and confidence</li>
          <li>• Compare items side-by-side before you buy</li>
          <li>• Learn the visual signs of ripeness and spoilage</li>
          <li>• Works offline — scans never leave your device</li>
        </ul>
      </section>
    </div>
  );
}
