// Mock AI analysis engine for AgriVision AI.
// Pure functions — replace with real model calls later without changing the UI.

export type Verdict = "Best Pick" | "Use Soon" | "Avoid";

export interface ScanInput {
  itemType: string; // e.g. "Banana", "Tomato"
  imageDataUrl?: string;
  // Optional simulated traits (slider-based scan demo)
  traits?: Partial<TraitVector>;
}

export interface TraitVector {
  colorUniformity: number; // 0-1
  brightness: number; // 0-1 (0 dark/green, 1 bright)
  spotCoverage: number; // 0-1 (more = worse)
  bruising: number; // 0-1
  wrinkling: number; // 0-1
  surfaceDamage: number; // 0-1
  ripeness: number; // 0-1 (0 unripe, 0.5 ripe, 1 overripe)
}

export interface AnalysisResult {
  id: string;
  itemType: string;
  verdict: Verdict;
  score: number; // 0-10
  confidence: number; // 0-100
  reason: string;
  recommendation: string;
  traits: { label: string; value: string; tone: "good" | "warn" | "bad" }[];
  ripenessStage: string;
  imageDataUrl?: string;
  createdAt: number;
}

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = (h * 16777619) >>> 0;
  }
  return h;
}

function rand01(seed: number): number {
  // mulberry32
  let t = (seed += 0x6d2b79f5);
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function generateTraits(seed: number, base?: Partial<TraitVector>): TraitVector {
  const r = (k: number) => rand01(seed + k);
  return {
    colorUniformity: base?.colorUniformity ?? 0.55 + r(1) * 0.45,
    brightness: base?.brightness ?? 0.4 + r(2) * 0.6,
    spotCoverage: base?.spotCoverage ?? r(3) * 0.5,
    bruising: base?.bruising ?? r(4) * 0.4,
    wrinkling: base?.wrinkling ?? r(5) * 0.35,
    surfaceDamage: base?.surfaceDamage ?? r(6) * 0.3,
    ripeness: base?.ripeness ?? r(7),
  };
}

function bananaStage(t: TraitVector): string {
  const r = t.ripeness;
  if (r < 0.18) return "Green / Unripe";
  if (r < 0.4) return "Slightly yellow";
  if (r < 0.65) return "Fully ripe";
  if (r < 0.85) return "Overripe";
  return "Spoiled";
}

function genericStage(t: TraitVector): string {
  if (t.surfaceDamage > 0.6 || t.spotCoverage > 0.6) return "Deteriorating";
  if (t.ripeness < 0.3) return "Underripe";
  if (t.ripeness < 0.7) return "Fresh & ripe";
  return "Past peak";
}

export function analyze(input: ScanInput): AnalysisResult {
  const seed = hashStr(
    (input.itemType || "item") +
      (input.imageDataUrl ? input.imageDataUrl.slice(0, 96) : Math.random().toString()),
  );
  const t = generateTraits(seed, input.traits);

  // Score formula: rewards uniformity, penalizes defects + extreme ripeness
  const ripenessPenalty = Math.abs(t.ripeness - 0.5) * 1.4;
  const defects = t.spotCoverage * 1.2 + t.bruising * 1.5 + t.wrinkling + t.surfaceDamage * 1.3;
  const positives = t.colorUniformity * 1.3 + t.brightness * 0.6;
  const raw = 6 + positives * 2.2 - defects * 2.4 - ripenessPenalty * 1.1;
  const score = Math.max(1, Math.min(10, +raw.toFixed(1)));

  const confidence = Math.round(78 + rand01(seed + 99) * 20);

  let verdict: Verdict;
  if (score >= 7.5) verdict = "Best Pick";
  else if (score >= 5) verdict = "Use Soon";
  else verdict = "Avoid";

  const isBanana = input.itemType.toLowerCase().includes("banana");
  const stage = isBanana ? bananaStage(t) : genericStage(t);

  const traits = [
    {
      label: "Color uniformity",
      value: pct(t.colorUniformity),
      tone: tone(t.colorUniformity, true),
    },
    { label: "Surface texture", value: pct(1 - t.wrinkling), tone: tone(1 - t.wrinkling, true) },
    { label: "Spot coverage", value: pct(t.spotCoverage), tone: tone(t.spotCoverage, false) },
    { label: "Bruising", value: pct(t.bruising), tone: tone(t.bruising, false) },
    { label: "Surface damage", value: pct(t.surfaceDamage), tone: tone(t.surfaceDamage, false) },
    { label: "Ripeness stage", value: stage, tone: stageTone(t.ripeness) },
  ] as AnalysisResult["traits"];

  const reason = buildReason(t, stage, verdict);
  const recommendation = buildRecommendation(verdict, stage, isBanana);

  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    itemType: input.itemType,
    verdict,
    score,
    confidence,
    reason,
    recommendation,
    traits,
    ripenessStage: stage,
    imageDataUrl: input.imageDataUrl,
    createdAt: Date.now(),
  };
}

function pct(v: number) {
  return `${Math.round(v * 100)}%`;
}
function tone(v: number, higherIsBetter: boolean): "good" | "warn" | "bad" {
  const x = higherIsBetter ? v : 1 - v;
  if (x > 0.7) return "good";
  if (x > 0.4) return "warn";
  return "bad";
}
function stageTone(r: number): "good" | "warn" | "bad" {
  if (r > 0.85 || r < 0.1) return "bad";
  if (r > 0.65 || r < 0.25) return "warn";
  return "good";
}

function buildReason(t: TraitVector, stage: string, verdict: Verdict): string {
  const parts: string[] = [];
  if (t.colorUniformity > 0.75) parts.push("uniform color");
  else if (t.colorUniformity < 0.45) parts.push("uneven coloration");
  if (t.spotCoverage > 0.5) parts.push("notable dark spots");
  if (t.bruising > 0.4) parts.push("visible bruising");
  if (t.wrinkling > 0.4) parts.push("wrinkled surface");
  if (t.surfaceDamage > 0.4) parts.push("surface damage");
  if (parts.length === 0) parts.push("smooth surface and no major defects");
  const lead =
    verdict === "Best Pick" ? "High quality —" : verdict === "Use Soon" ? "Acceptable —" : "Poor —";
  return `${lead} ${stage.toLowerCase()} with ${parts.join(", ")}.`;
}

function buildRecommendation(v: Verdict, stage: string, isBanana: boolean): string {
  if (v === "Avoid") return "Do not buy. Likely to spoil within 24 hours.";
  if (v === "Use Soon")
    return isBanana
      ? "Eat within 1–2 days or use for baking / smoothies."
      : "Consume within 1–2 days for best quality.";
  return isBanana
    ? "Good for immediate consumption. Stays fresh for several days."
    : "Excellent choice — store normally and enjoy.";
}

export interface CompareOutcome {
  winnerId: string;
  rationale: string;
}
export function compareResults(results: AnalysisResult[]): CompareOutcome | null {
  if (results.length < 2) return null;
  const sorted = [...results].sort((a, b) => b.score - a.score);
  const w = sorted[0];
  const r = sorted[1];
  return {
    winnerId: w.id,
    rationale: `${w.itemType} scores ${w.score}/10 vs ${r.score}/10 — ${w.reason}`,
  };
}