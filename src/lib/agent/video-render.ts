/**
 * Finishing step — the smallest honest video renderer.
 *
 * This is NOT a full video generator: it turns an existing video brief
 * (src/lib/agent/video-social.ts) into a real MP4 slideshow — one 9:16
 * card per script sentence, 3 seconds each, with the hook text on screen.
 * It is a deterministic local render (ffmpeg + DejaVu), no AI video model,
 * no voiceover. Voiceover and motion still need a TTS + template service
 * (see STATUS.md "Cannot do here" — template renderer + TTS).
 *
 * Why a slideshow and not a promise: a brief is a plan, not a video.
 * Rendering the brief as an MP4 means the "video" the owner downloads is a
 * real file they can post as a story/Reel draft, and the gap (no voice,
 * no motion, no product footage) is visible instead of hidden.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { VideoVariant } from "./video-social";

export const SLIDESHOW_SECONDS_PER_CARD = 3;
export const SLIDESHOW_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf";

export type SlideshowRender = { path: string; variant: number; cards: number; seconds: number };

/** Split a variant script into on-screen cards (one sentence per card, max 6). */
export function scriptCards(variant: VideoVariant): string[] {
  const sentences = variant.script.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean);
  return sentences.slice(0, 6);
}

/** Escape text for ffmpeg drawtext (single-quoted filter value). */
export function drawtextSafe(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/'/g, "\\'").replace(/:/g, "\\:").replace(/%/g, "%%").slice(0, 140);
}

/**
 * Render one variant to a 720x1280 MP4. Throws on ffmpeg failure.
 * Deterministic: same brief + same out path = same frames (no model call).
 */
export function renderSlideshow(variant: VideoVariant, outPath: string, opts: { ffmpeg?: string; font?: string } = {}): SlideshowRender {
  const ffmpeg = opts.ffmpeg ?? "ffmpeg";
  const font = opts.font ?? SLIDESHOW_FONT;
  const cards = scriptCards(variant);
  if (cards.length === 0) throw new Error("Cannot render a variant with no script cards");
  const dir = join(outPath, "..");
  mkdirSync(dir, { recursive: true });
  const tmp = join(dir, `.helix-render-${variant.variant}-${Date.now()}`);
  mkdirSync(tmp, { recursive: true });
  try {
    cards.forEach((text, i) => {
      // Dark card, white wrapped text, product name as a footer line.
      const filter = `color=c=0x0f172a:s=720x1280,drawtext=fontfile=${font}:text='${drawtextSafe(text)}':fontsize=44:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40:box=1:boxcolor=0x0f172a@0.0:boxborderw=20,drawtext=fontfile=${font}:text='${drawtextSafe(variant.hook.slice(0, 40))}':fontsize=28:fontcolor=0x67e8f9:x=(w-text_w)/2:y=h-120`;
      execFileSync(ffmpeg, ["-f", "lavfi", "-i", filter, "-frames:v", "1", "-y", join(tmp, `card-${i}.png`)], { stdio: "pipe", timeout: 30_000 });
    });
    const listPath = join(tmp, "list.txt");
    writeFileSync(listPath, cards.map((_, i) => `file '${join(tmp, `card-${i}.png`)}'\nduration ${SLIDESHOW_SECONDS_PER_CARD}`).join("\n"));
    execFileSync(ffmpeg, ["-f", "concat", "-safe", "0", "-i", listPath, "-vf", "format=yuv420p", "-c:v", "libx264", "-r", "30", "-movflags", "+faststart", "-y", outPath], { stdio: "pipe", timeout: 120_000 });
    return { path: outPath, variant: variant.variant, cards: cards.length, seconds: cards.length * SLIDESHOW_SECONDS_PER_CARD };
  } finally {
    // Keep the temp dir only on failure for debugging; it is under the OS tmp
    // area when outPath is there. Best-effort cleanup.
    try { execFileSync("rm", ["-rf", tmp]); } catch { /* ignore */ }
  }
}

export function ffmpegAvailable(ffmpeg = "ffmpeg"): boolean {
  try { execFileSync(ffmpeg, ["-version"], { stdio: "pipe", timeout: 10_000 }); return true; } catch { return false; }
}

export function renderAvailable(): boolean {
  return ffmpegAvailable() && existsSync(SLIDESHOW_FONT);
}
