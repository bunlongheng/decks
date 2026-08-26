import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  serverExternalPackages: ["@resvg/resvg-js", "sharp"],
};

export default nextConfig;
