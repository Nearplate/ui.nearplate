import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Minimal self-contained server output, used by the production Dockerfile.
  output: "standalone",
  poweredByHeader: false,
}

export default nextConfig
