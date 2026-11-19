/** Finishing step — slideshow renderer: pure parts always, ffmpeg part only when present. */
import { describe, expect, it } from "vitest";
import { existsSync, mkdtempSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { drawtextSafe, ffmpegAvailable, renderSlideshow, scriptCards } from "@/lib/agent/video-render";

const VARIANT = {
  variant: 1, variable: "Hook (first 3 seconds)" as const,
  hook: "Stop scrolling — this is the one our customers keep reordering.",
  script: "Stop scrolling. Customers keep coming back for it. Linen Shirt, $89. See why it works — link in bio.",
  caption: "x", hashtags: [], format: "9:16" as const, durationSeconds: 30,
};

describe("scriptCards / drawtextSafe", () => {
  it("splits a script into one card per sentence", () => {
    expect(scriptCards(VARIANT)).toHaveLength(4);
  });
  it("escapes quotes, colons and percent for ffmpeg drawtext", () => {
    expect(drawtextSafe("50% off: it's here")).toBe("50%% off\\: it\\'s here");
  });
});

describe("renderSlideshow", () => {
  it("produces a real MP4 when ffmpeg is available", () => {
    if (!ffmpegAvailable()) { console.log("ffmpeg not available — skipping render test"); return; }
    const dir = mkdtempSync(join(tmpdir(), "helix-render-test-"));
    const out = join(dir, "v1.mp4");
    const r = renderSlideshow(VARIANT, out);
    expect(r.cards).toBe(4);
    expect(existsSync(out)).toBe(true);
    expect(statSync(out).size).toBeGreaterThan(1_000);
    rmSync(dir, { recursive: true, force: true });
  }, 60_000); // ffmpeg spawns are slow under parallel test load (default 5s is too short)
});
