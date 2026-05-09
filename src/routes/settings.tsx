import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Glasses, Mic, Moon, Shield, Sun, Languages } from "lucide-react";
import { defaultSettings, getSettings, saveSettings, type AppSettings } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-background transition-all ${
          checked ? "left-[22px]" : "left-0.5"
        }`}
      />
    </button>
  );
}

function SettingsPage() {
  const [s, setS] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    setS(getSettings());
  }, []);

  function update<K extends keyof AppSettings>(k: K, v: AppSettings[K]) {
    const next = { ...s, [k]: v };
    setS(next);
    saveSettings(next);
    if (k === "theme") {
      document.documentElement.classList.toggle("dark", v === "dark");
    }
  }

  const Row = ({
    icon: Icon,
    title,
    desc,
    children,
  }: {
    icon: any;
    title: string;
    desc: string;
    children: React.ReactNode;
  }) => (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
      <span className="grid place-items-center h-10 w-10 rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1">
        <div className="font-medium text-sm">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Personalize AgriVision AI.</p>
      </div>

      <Row icon={Languages} title="Language" desc="Preferred interface language">
        <select
          value={s.language}
          onChange={(e) => update("language", e.target.value as AppSettings["language"])}
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="en">English</option>
          <option value="hi">हिंदी</option>
          <option value="es">Español</option>
        </select>
      </Row>

      <Row icon={Mic} title="Voice feedback" desc="Read results aloud after each scan">
        <Toggle checked={s.voice} onChange={(v) => update("voice", v)} />
      </Row>

      <Row icon={s.theme === "dark" ? Moon : Sun} title="Display mode" desc="Switch light or dark theme">
        <select
          value={s.theme}
          onChange={(e) => update("theme", e.target.value as AppSettings["theme"])}
          className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </Row>

      <Row icon={Glasses} title="Smart glasses mode" desc="Optimize layout for AR overlays">
        <Toggle checked={s.smartGlasses} onChange={(v) => update("smartGlasses", v)} />
      </Row>

      <Row icon={Shield} title="Privacy: local only" desc="Keep all scans on this device">
        <Toggle checked={s.privacyLocalOnly} onChange={(v) => update("privacyLocalOnly", v)} />
      </Row>

      <p className="text-[11px] text-muted-foreground text-center pt-4">
        AgriVision AI · MVP build · No account required
      </p>
    </div>
  );
}