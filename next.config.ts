import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Learn pages read the playbook markdown from disk.
  outputFileTracingIncludes: { "/learn/**": ["./docs/playbook/**/*"] },
};

export default nextConfig;
