import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Lets a second dev server (e.g. an agent's) use its own build output
  distDir: process.env.NEXT_DIST_DIR || ".next",
}

export default nextConfig
