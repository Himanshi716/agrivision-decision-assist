import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { analyze, type AnalysisResult } from "./analysis";
import type { Json } from "@/integrations/supabase/types";

const DeviceSchema = z.string().min(8).max(128);

const AnalyzeInput = z.object({
  deviceId: DeviceSchema,
  itemType: z.string().min(1).max(64),
  hasImage: z.boolean().optional().default(false),
  imageSeed: z.string().max(256).optional(),
});

export const analyzeScan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) => {
    const result: AnalysisResult = analyze({
      itemType: data.itemType,
      imageDataUrl: data.imageSeed,
    });

    const { data: row, error } = await supabase
      .from("scans")
      .insert({
        device_id: data.deviceId,
        item_type: result.itemType,
        verdict: result.verdict,
        score: result.score,
        confidence: result.confidence,
        reason: result.reason,
        recommendation: result.recommendation,
        ripeness_stage: result.ripenessStage,
        traits: result.traits as unknown as Json,
        has_image: !!data.hasImage,
      })
      .select()
      .single();

    if (error) {
      console.error("analyzeScan insert error", error);
      throw new Error("Failed to save scan");
    }

    return { id: row.id as string, result };
  });

const HistoryInput = z.object({
  deviceId: DeviceSchema,
  limit: z.number().min(1).max(100).optional(),
});

export const listScans = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => HistoryInput.parse(input))
  .handler(async ({ data }) => {
    const { data: rows, error } = await supabase
      .from("scans")
      .select("*")
      .eq("device_id", data.deviceId)
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 50);
    if (error) {
      console.error("listScans error", error);
      return { scans: [] as ScanRow[] };
    }
    return { scans: (rows ?? []) as unknown as ScanRow[] };
  });

const GetInput = z.object({ id: z.string().uuid() });

export const getScan = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => GetInput.parse(input))
  .handler(async ({ data }) => {
    const { data: row, error } = await supabase
      .from("scans")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
    if (error) {
      console.error("getScan error", error);
      return { scan: null as ScanRow | null };
    }
    return { scan: (row as unknown as ScanRow | null) ?? null };
  });

const FeedbackInput = z.object({
  deviceId: DeviceSchema,
  scanId: z.string().uuid(),
  helpful: z.boolean(),
  note: z.string().max(500).optional(),
});

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => FeedbackInput.parse(input))
  .handler(async ({ data }) => {
    const { error } = await supabase.from("feedback").insert({
      device_id: data.deviceId,
      scan_id: data.scanId,
      helpful: data.helpful,
      note: data.note ?? null,
    });
    if (error) {
      console.error("submitFeedback error", error);
      throw new Error("Failed to save feedback");
    }
    return { ok: true as const };
  });

const ClearInput = z.object({ deviceId: DeviceSchema });
export const clearScans = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ClearInput.parse(input))
  .handler(async ({ data }) => {
    // Deletions bypass RLS — scoped strictly to the validated device_id.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("scans").delete().eq("device_id", data.deviceId);
    if (error) {
      console.error("clearScans error", error);
      throw new Error("Failed to clear");
    }
    return { ok: true as const };
  });

export type ScanRow = {
  id: string;
  device_id: string;
  item_type: string;
  verdict: "Best Pick" | "Use Soon" | "Avoid";
  score: number;
  confidence: number;
  reason: string;
  recommendation: string;
  ripeness_stage: string;
  traits: { label: string; value: string; tone: "good" | "warn" | "bad" }[];
  has_image: boolean;
  created_at: string;
};