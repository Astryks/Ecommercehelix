import type { NextConfig } from "next";
import aliases from "./src/lib/lesson-aliases.json";

const nextConfig: NextConfig = {
  // Learn pages read the playbook markdown from disk.
  outputFileTracingIncludes: { "/learn/**": ["./docs/playbook/**/*"], "/dashboard/**": ["./docs/playbook/**/*"] },
  async redirects() {
    return [
      { source: "/pricing", destination: "/#pricing", permanent: false },
      { source: "/login", destination: "/signin", permanent: false },
      // Module pages renumbered in the 26 Oct 2026 reorder. The #lesson anchor carries over and the page jumps to it.
      // Old card deck links (/learn/<old>/cards/<old ref>) are redirected by that page.
      ...Object.entries(aliases.modules as Record<string, string>).map(([from, to]) => ({ source: `/learn/${from}`, destination: `/learn/${to}`, permanent: true })),
    ];
  },
};

export default nextConfig;
