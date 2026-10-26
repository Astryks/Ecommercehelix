/**
 * Helix course videos (Intro + chapters 1 to 40). The MP4s are about 14 GB in total, so they are
 * never committed to git. Host them anywhere that serves public HTTPS files (for example Vercel Blob,
 * see docs/course-videos.md) and point Helix at them in one of two ways:
 *
 * 1. COURSE_VIDEO_BASE_URL: one folder for all files, e.g. https://xyz.public.blob.vercel-storage.com/course
 *    Each video plays from `${base}/${file}`.
 * 2. `url` on a single entry below: overrides the base for that one video (YouTube is not used here).
 *
 * With neither set, the Learn page shows the chapter list as "coming soon" and plays nothing.
 */
export type CourseVideo = { id: string; title: string; file: string; url?: string; poster?: string };

export const VIDEOS: CourseVideo[] = [
  { id: "intro", title: "Everything Is Someone's Business", file: "Helix-Intro.mp4" },
  { id: "ch01", title: "Idea and Design", file: "Helix-Chapter-01.mp4" },
  { id: "ch02", title: "Find a Maker and Make a Deal", file: "Helix-Chapter-02.mp4" },
  { id: "ch03", title: "Fabric, Samples and Fit", file: "Helix-Chapter-03.mp4" },
  { id: "ch04", title: "Brand, Store and Money", file: "Helix-Chapter-04.mp4" },
  { id: "ch05", title: "Launch and Sell", file: "Helix-Chapter-05.mp4" },
  { id: "ch06", title: "What One Pair Really Costs", file: "Helix-Chapter-06.mp4" },
  { id: "ch07", title: "Know Your Customer", file: "Helix-Chapter-07.mp4" },
  { id: "ch08", title: "Make Your Website Look Good", file: "Helix-Chapter-08.mp4" },
  { id: "ch09", title: "Build a Store People Trust", file: "Helix-Chapter-09.mp4" },
  { id: "ch10", title: "Set Up Your Emails", file: "Helix-Chapter-10.mp4" },
  { id: "ch11", title: "Instagram, TikTok and Search", file: "Helix-Chapter-11.mp4" },
  { id: "ch12", title: "Friends, Family and Weekend Markets", file: "Helix-Chapter-12.mp4" },
  { id: "ch13", title: "Creators and Partners", file: "Helix-Chapter-13.mp4" },
  { id: "ch14", title: "Know Your Ad Limit", file: "Helix-Chapter-14.mp4" },
  { id: "ch15", title: "Start Testing Ads: Facebook First", file: "Helix-Chapter-15.mp4" },
  { id: "ch16", title: "Audiences and Ad Ideas", file: "Helix-Chapter-16.mp4" },
  { id: "ch17", title: "Make Ads People Watch", file: "Helix-Chapter-17.mp4" },
  { id: "ch18", title: "Read Results, Test and Stop", file: "Helix-Chapter-18.mp4" },
  { id: "ch19", title: "Then Try Google, TikTok and Pinterest", file: "Helix-Chapter-19.mp4" },
  { id: "ch20", title: "Turn Ad Viewers Into Buyers", file: "Helix-Chapter-20.mp4" },
  { id: "ch21", title: "Test and Improve Pages", file: "Helix-Chapter-21.mp4" },
  { id: "ch22", title: "Reviews, Service and Feedback", file: "Helix-Chapter-22.mp4" },
  { id: "ch23", title: "Price It So It Pays", file: "Helix-Chapter-23.mp4" },
  { id: "ch24", title: "Offers, Bundles and Add-ons", file: "Helix-Chapter-24.mp4" },
  { id: "ch25", title: "Big Sales Done Right", file: "Helix-Chapter-25.mp4" },
  { id: "ch26", title: "Emails That Close the Sale", file: "Helix-Chapter-26.mp4" },
  { id: "ch27", title: "Your Numbers: CTR, Conversion and AOV", file: "Helix-Chapter-27.mp4" },
  { id: "ch28", title: "CPA, ROAS, MER and Break-Even", file: "Helix-Chapter-28.mp4" },
  { id: "ch29", title: "Funnel Maths and the Morning Check", file: "Helix-Chapter-29.mp4" },
  { id: "ch30", title: "Scale What Works", file: "Helix-Chapter-30.mp4" },
  { id: "ch31", title: "Bring Them Back: Reorders and LTV", file: "Helix-Chapter-31.mp4" },
  { id: "ch32", title: "Cash, Profit and Borrowing", file: "Helix-Chapter-32.mp4" },
  { id: "ch33", title: "Pick a Supplier, Check the Quality", file: "Helix-Chapter-33.mp4" },
  { id: "ch34", title: "Plan Stock and Cash", file: "Helix-Chapter-34.mp4" },
  { id: "ch35", title: "Grown-Up Basics: Safe and Legal", file: "Helix-Chapter-35.mp4" },
  { id: "ch36", title: "Records, Returns and Shipping", file: "Helix-Chapter-36.mp4" },
  { id: "ch37", title: "Sell Overseas", file: "Helix-Chapter-37.mp4" },
  { id: "ch38", title: "Systems: Fix the Bottleneck and Hire Help", file: "Helix-Chapter-38.mp4" },
  { id: "ch39", title: "Founder Habits", file: "Helix-Chapter-39.mp4" },
  { id: "ch40", title: "Founder Stories: From Side Hustle to Growing Brand", file: "Helix-Chapter-40.mp4" },
];

/** The playable URL for a video, or null when it is not uploaded yet. Only https URLs are accepted. */
export function videoUrl(v: CourseVideo, base = process.env.COURSE_VIDEO_BASE_URL): string | null {
  const raw = v.url ?? (base ? `${base.replace(/\/+$/, "")}/${encodeURIComponent(v.file)}` : null);
  if (!raw) return null;
  try {
    return new URL(raw).protocol === "https:" ? raw : null;
  } catch {
    return null;
  }
}

export function courseVideos(base = process.env.COURSE_VIDEO_BASE_URL) {
  return VIDEOS.map((v, i) => ({ ...v, n: i, src: videoUrl(v, base) }));
}
