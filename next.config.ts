import type { NextConfig } from "next";

import path from "path";

const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  output: isCapacitor ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (process.env.CAPACITOR_BUILD === 'true' && !isServer) {
      config.resolve.alias['@/app/quotes/actions'] = path.resolve(__dirname, 'src/lib/action-proxy.ts');
      config.resolve.alias['@/app/recreation/actions'] = path.resolve(__dirname, 'src/lib/action-proxy.ts');
      config.resolve.alias['@/app/games/crosswords/actions'] = path.resolve(__dirname, 'src/lib/action-proxy.ts');
    }
    return config;
  }
};

export default nextConfig;
