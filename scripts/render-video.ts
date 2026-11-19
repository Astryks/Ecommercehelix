/**
 * Finishing step — render a real MP4 slideshow from a video brief.
 *
 *   npx vite-node scripts/render-video.ts --product "Linen Shirt" --price 89 --out /tmp/linen-shirt-v1.mp4
 *
 * Builds the brief with buildVideoBrief (same function the dashboard uses),
 * then renders variant 1 with ffmpeg (src/lib/agent/video-render.ts).
 * Output is a 720x1280 MP4, one card per script sentence, 3s each, no audio.
 * Needs ffmpeg + DejaVu fonts on the machine (present in this sandbox and
 * on most Linux hosts; `brew install ffmpeg` on a Mac). No voiceover, no
 * motion, no product footage — for those, see STATUS.md (template renderer
 * + TTS is a separate service, not built here).
 */
import { writeFileSync } from "node:fs";
import { buildVideoBrief } from "../src/lib/agent/video-social";
import { ffmpegAvailable, renderAvailable, renderSlideshow } from "../src/lib/agent/video-render";

const arg = (name: string, fallback: string) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

const product = arg("--product", "Linen Shirt");
const price = Number(arg("--price", "89"));
const out = arg("--out", "/tmp/helix-video-v1.mp4");

if (!ffmpegAvailable()) {
  console.error("ffmpeg is not on PATH. Install it first (e.g. `brew install ffmpeg` or `apt install ffmpeg`).");
  process.exit(1);
}
if (!renderAvailable()) {
  console.error("DejaVu fonts not found at /usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf — install fonts-dejavu-core.");
  process.exit(1);
}
const brief = buildVideoBrief({
  productName: product,
  productPrice: price,
  stockDaysLeft: null,
  openings: [],
  reviewPhrases: ["customers keep coming back for it"],
  ugcAvailable: false,
  ugcPermission: false,
  bannedWords: [],
  discountCeilingPct: 20,
});
if (brief.blockedBy) {
  console.error(`Blocked: ${brief.blockedBy}`);
  process.exit(1);
}
const variant = brief.variants[0];
const result = renderSlideshow(variant, out);
console.log(`Rendered variant ${result.variant}: ${result.cards} cards, ${result.seconds}s -> ${result.path}`);
console.log(`Caption: ${variant.caption}`);
writeFileSync(`${out}.caption.txt`, variant.caption);
