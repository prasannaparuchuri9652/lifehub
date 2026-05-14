import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config) => {
    // pg-native is an optional native binding — not needed in Next.js
    config.externals = [...(config.externals ?? []), { "pg-native": "pg-native" }];
    return config;
  },
};

export default nextConfig;
