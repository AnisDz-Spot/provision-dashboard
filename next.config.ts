import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Specify the root directory for Turbopack to avoid multiple lockfile warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
