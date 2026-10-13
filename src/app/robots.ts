import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

const PRIVATE = ["/dashboard", "/course", "/api/", "/signin"];
const BOTS = ["Googlebot", "Bingbot", "Google-Extended", "GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "PerplexityBot", "Applebot", "Applebot-Extended"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...BOTS.map((userAgent) => ({ userAgent, allow: "/", disallow: PRIVATE })),
      { userAgent: "*", allow: "/", disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
