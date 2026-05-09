import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import { Trash2, ScanLine, Loader2 } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { listScans, clearScans, type ScanRow } from "@/lib/scan.functions";
import { getDeviceId } from "@/lib/device";
import { VerdictBadge } from "@/components/VerdictBadge";
import { itemTypes } from "@/lib/learn-content";

export const Route = createFileRoute("/history")({
  component: HistoryPage,
});

function HistoryPage() {
  const [items, setItems] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchHistory = useServerFn(listScans);
  const clearAllFn = useServerFn(clearScans);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { scans } = await fetchHistory({ data: { deviceId: getDeviceId() } });
      setItems(scans);
    } finally {
      setLoading(false);
    }
  }, [fetchHistory]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function clearAll() {
    await clearAllFn({ data: { deviceId: getDeviceId() } });
    setItems([]);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">History</h1>
          <p className="text-sm text-muted-foreground">
            {loading ? "Loading…" : `${items.length} past scans`}
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-3.5 w-3.5" /> Clear
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid place-items-center py-16 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3">
          <p className="text-muted-foreground text-sm">No scans yet.</p>
          <Link
            to="/scan"
            className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-primary-foreground"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <ScanLine className="h-4 w-4" /> Start scanning
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((r) => {
            const emoji = itemTypes.find((i) => i.value === r.item_type)?.emoji ?? "🌿";
            return (
              <Link
                key={r.id}
                to="/result/$id"
                params={{ id: r.id }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3 hover:border-primary/40 transition"
              >
                <div className="h-12 w-12 rounded-xl bg-muted grid place-items-center text-2xl overflow-hidden">
                  <span>{emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{r.item_type}</span>
                    <VerdictBadge verdict={r.verdict} size="sm" />
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {new Date(r.created_at).toLocaleString()} · {r.ripeness_stage}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold leading-none">{r.score}</div>
                  <div className="text-[10px] text-muted-foreground">/10</div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}