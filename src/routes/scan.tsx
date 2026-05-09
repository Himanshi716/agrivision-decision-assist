import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Zap, ZapOff, Sparkles, ImageIcon, Loader2 } from "lucide-react";
import { itemTypes } from "@/lib/learn-content";
import { useServerFn } from "@tanstack/react-start";
import { analyzeScan } from "@/lib/scan.functions";
import { getDeviceId } from "@/lib/device";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({
  component: ScanPage,
});

function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [item, setItem] = useState("Banana");
  const [autoDetect, setAutoDetect] = useState(true);
  const [flash, setFlash] = useState(false);
  const [imageData, setImageData] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const analyzeFn = useServerFn(analyzeScan);

  useEffect(() => {
    let active = true;
    async function start() {
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!active) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch {
        setError("Camera unavailable. Use upload instead.");
      }
    }
    start();
    return () => {
      active = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function captureFrame(): string | null {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return null;
    const canvas = document.createElement("canvas");
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(v, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.7);
  }

  function handleFile(f: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setImageData(reader.result as string);
    };
    reader.readAsDataURL(f);
  }

  async function runAnalysis(dataUrl: string | null) {
    setAnalyzing(true);
    try {
      const seed = dataUrl ? await fingerprint(dataUrl) : undefined;
      const { id } = await analyzeFn({
        data: {
          deviceId: getDeviceId(),
          itemType: item,
          hasImage: !!dataUrl,
          imageSeed: seed,
        },
      });
      navigate({ to: "/result/$id", params: { id } });
    } catch (e) {
      console.error(e);
      toast.error("Could not analyze. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  function onCapture() {
    const data = captureFrame();
    setImageData(data);
    runAnalysis(data);
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Scan</h1>
        <p className="text-sm text-muted-foreground">Point camera at the produce or upload an image.</p>
      </div>

      <div className="relative aspect-[3/4] sm:aspect-video w-full overflow-hidden rounded-3xl border border-border bg-black">
        {imageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageData} alt="captured" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {/* Reticle */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-56 w-56 sm:h-64 sm:w-64 rounded-3xl border-2 border-primary-foreground/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
        </div>
        {/* Top bar */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between">
          <select
            value={item}
            onChange={(e) => setItem(e.target.value)}
            className="bg-black/50 backdrop-blur text-white text-sm rounded-full px-3 py-1.5 border border-white/20"
          >
            {itemTypes.map((i) => (
              <option key={i.value} value={i.value}>
                {i.emoji} {i.value}
              </option>
            ))}
          </select>
          <button
            onClick={() => setFlash((f) => !f)}
            className="h-9 w-9 grid place-items-center rounded-full bg-black/50 text-white border border-white/20"
            aria-label="Flash"
          >
            {flash ? <Zap className="h-4 w-4" /> : <ZapOff className="h-4 w-4" />}
          </button>
        </div>
        {/* Status */}
        {error && (
          <div className="absolute bottom-3 inset-x-3 text-center text-xs text-white/80 bg-black/50 backdrop-blur rounded-full py-2">
            {error}
          </div>
        )}
        {analyzing && (
          <div className="absolute inset-0 grid place-items-center bg-black/60 text-white">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">Analyzing {item}…</span>
            </div>
          </div>
        )}
      </div>

      <label className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3">
        <span className="flex items-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-primary" /> Auto-detect item type
        </span>
        <input
          type="checkbox"
          checked={autoDetect}
          onChange={(e) => setAutoDetect(e.target.checked)}
          className="h-4 w-4 accent-[oklch(0.55_0.17_145)]"
        />
      </label>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 hover:border-primary/40 transition"
        >
          <Upload className="h-5 w-5" />
          <span className="text-xs">Upload</span>
        </button>
        <button
          onClick={onCapture}
          disabled={analyzing}
          className="flex flex-col items-center gap-1 rounded-2xl text-primary-foreground py-3 disabled:opacity-50"
          style={{ backgroundImage: "var(--gradient-primary)", boxShadow: "var(--shadow-elegant)" }}
        >
          <Camera className="h-6 w-6" />
          <span className="text-xs font-medium">Capture</span>
        </button>
        <button
          onClick={() => runAnalysis(null)}
          disabled={analyzing}
          className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-card py-3 hover:border-primary/40 transition disabled:opacity-50"
        >
          <ImageIcon className="h-5 w-5" />
          <span className="text-xs">Demo scan</span>
        </button>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          handleFile(f);
          const reader = new FileReader();
          reader.onload = () => runAnalysis(reader.result as string);
          reader.readAsDataURL(f);
        }}
      />
    </div>
  );
}

// Tiny fingerprint of the captured image so the server can deterministically
// seed analysis without us ever uploading the bytes.
async function fingerprint(dataUrl: string): Promise<string> {
  const slice = dataUrl.slice(0, 4096);
  const bytes = new TextEncoder().encode(slice);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .slice(0, 16)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}