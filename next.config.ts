import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Minimal self-contained server output, used by the production Dockerfile.
  // Vercel produces its own output and fails on "standalone", so skip it there.
  output: process.env.VERCEL ? undefined : "standalone",
  poweredByHeader: false,
}

export default nextConfig
