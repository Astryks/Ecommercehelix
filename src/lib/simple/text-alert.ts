/** Playful openers for the "Overwhelming text alert" box. Picked by a stable hash so a page always shows the same one. */
export const ALERT_LEADS = [
  "Overwhelming text alert!",
  "Big block of words ahead!",
  "Heads up, wall of text!",
  "Lots of reading here!",
  "Long bit coming up!",
] as const;

export const ALERT_BRIDGES = [
  "This seems like a lot, but all we're saying is:",
  "Don't worry, the short version is:",
  "In one line:",
  "Here's the gist:",
] as const;

export function hashSeed(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function alertWords(seed: string) {
  const h = hashSeed(seed);
  return { lead: ALERT_LEADS[h % ALERT_LEADS.length], bridge: ALERT_BRIDGES[Math.floor(h / 7) % ALERT_BRIDGES.length] };
}

/** Word count above which copy should sit inside a TextAlert. */
export const LONG_TEXT_WORDS = 45;
export const isLongText = (t: string) => t.trim().split(/\s+/).filter(Boolean).length > LONG_TEXT_WORDS;
