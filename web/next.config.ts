import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/villa",        destination: "/catalog?type=villa" },
      { source: "/jeep",         destination: "/catalog?type=jeep" },
      { source: "/rent",         destination: "/catalog?type=transport" },
      { source: "/dokumentasi",  destination: "/catalog?type=dokumentasi" },
    ];
  },
};

export default nextConfig;
