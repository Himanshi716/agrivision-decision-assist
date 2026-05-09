import { Link, Outlet, useLocation } from "@tanstack/react-router";
import { Home, ScanLine, GitCompare, BookOpen, History, Settings, Leaf } from "lucide-react";
import { useEffect } from "react";
import { getSettings } from "@/lib/storage";

const tabs = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/scan", icon: ScanLine, label: "Scan" },
  { to: "/compare", icon: GitCompare, label: "Compare" },
  { to: "/learn", icon: BookOpen, label: "Learn" },
  { to: "/history", icon: History, label: "History" },
];

export function AppShell() {
  const location = useLocation();

  useEffect(() => {
    const s = getSettings();
    document.documentElement.classList.toggle("dark", s.theme === "dark");
  }, []);

  const isResult = location.pathname.startsWith("/result");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="sticky top-0 z-30 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="grid place-items-center h-8 w-8 rounded-lg bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--shadow-elegant)]">
              <Leaf className="h-4 w-4" />
            </span>
            <span className="font-semibold tracking-tight">AgriVision <span className="text-primary">AI</span></span>
          </Link>
          <Link
            to="/settings"
            className="h-9 w-9 grid place-items-center rounded-md hover:bg-accent/40 text-muted-foreground"
            aria-label="Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className={`flex-1 mx-auto w-full max-w-3xl px-4 pt-4 ${isResult ? "pb-24" : "pb-28"}`}>
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto max-w-3xl grid grid-cols-5">
          {tabs.map((t) => {
            const active =
              t.to === "/" ? location.pathname === "/" : location.pathname.startsWith(t.to);
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors ${
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : ""}`} />
                <span>{t.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}