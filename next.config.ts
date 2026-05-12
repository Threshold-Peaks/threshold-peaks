import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/startseite-test",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;