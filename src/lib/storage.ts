import type { AnalysisResult } from "./analysis";

const HISTORY_KEY = "agrivision.history.v1";
const SETTINGS_KEY = "agrivision.settings.v1";
const FEEDBACK_KEY = "agrivision.feedback.v1";

export interface AppSettings {
  language: "en" | "hi" | "es";
  voice: boolean;
  theme: "light" | "dark";
  smartGlasses: boolean;
  privacyLocalOnly: boolean;
}

export const defaultSettings: AppSettings = {
  language: "en",
  voice: false,
  theme: "light",
  smartGlasses: false,
  privacyLocalOnly: true,
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function safeSet(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function getHistory(): AnalysisResult[] {
  return safeGet<AnalysisResult[]>(HISTORY_KEY, []);
}
export function addToHistory(r: AnalysisResult) {
  const list = [r, ...getHistory()].slice(0, 100);
  safeSet(HISTORY_KEY, list);
}
export function clearHistory() {
  safeSet(HISTORY_KEY, []);
}

export function getSettings(): AppSettings {
  return { ...defaultSettings, ...safeGet<Partial<AppSettings>>(SETTINGS_KEY, {}) };
}
export function saveSettings(s: AppSettings) {
  safeSet(SETTINGS_KEY, s);
}

export interface FeedbackEntry {
  id: string;
  resultId: string;
  helpful: boolean;
  note?: string;
  createdAt: number;
}
export function addFeedback(f: Omit<FeedbackEntry, "id" | "createdAt">) {
  const list = safeGet<FeedbackEntry[]>(FEEDBACK_KEY, []);
  list.unshift({ ...f, id: crypto.randomUUID(), createdAt: Date.now() });
  safeSet(FEEDBACK_KEY, list.slice(0, 200));
}