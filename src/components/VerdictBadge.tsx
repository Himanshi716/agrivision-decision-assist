import type { Verdict } from "@/lib/analysis";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export function VerdictBadge({ verdict, size = "md" }: { verdict: Verdict; size?: "sm" | "md" | "lg" }) {
  const map = {
    "Best Pick": {
      cls: "bg-success/15 text-success border-success/30",
      Icon: CheckCircle2,
    },
    "Use Soon": {
      cls: "bg-warning/15 text-warning-foreground border-warning/40",
      Icon: Clock,
    },
    Avoid: {
      cls: "bg-destructive/15 text-destructive border-destructive/30",
      Icon: XCircle,
    },
  } as const;
  const { cls, Icon } = map[verdict];
  const sz = size === "lg" ? "px-4 py-2 text-base" : size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${cls} ${sz}`}>
      <Icon className={size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5"} />
      {verdict}
    </span>
  );
}