// Rendered daily-seminar videos, keyed by curriculum seminar id.
// The mp4 files are NOT in git; `file` is the rendered filename (hosted separately).
export type SeminarVideo = { file: string; durationSec: number };

export const seminarVideos: Record<string, SeminarVideo> = {
  "emails-that-close": { file: "Helix-Seminar-01-emails-that-close.mp4", durationSec: 1182.4 },
};

export function getSeminarVideo(id: string): SeminarVideo | undefined {
  return seminarVideos[id];
}
