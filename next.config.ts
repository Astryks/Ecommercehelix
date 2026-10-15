import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Learn pages read the playbook markdown from disk.
  outputFileTracingIncludes: { "/learn/**": ["./docs/playbook/**/*"], "/dashboard/**": ["./docs/playbook/**/*"] },
  async redirects() {
    return [
      { source: "/pricing", destination: "/#pricing", permanent: false },
      { source: "/login", destination: "/signin", permanent: false },
    ];
  },
};

export default nextConfig;
