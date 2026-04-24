import type { NextConfig } from "next";

import path from "path";

const isCapacitor = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  output: isCapacitor ? 'export' : undefined,
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Acknowledge Turbopack while using custom webpack config
  // This silences the error in Next.js 16+
  // @ts-ignore
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (process.env.CAPACITOR_BUILD === 'true' && !isServer) {
      const proxyPath = path.resolve(__dirname, 'src/lib/action-proxy.ts');
      
      // Alias both the @/ version and the absolute path version
      const actionsToAlias = [
        'quotes/actions',
        'recreation/actions',
        'games/crosswords/actions',
        'activities/challenges/actions',
        'learn/philosophy/actions',
        'learn/science/actions'
      ];

      actionsToAlias.forEach(action => {
        config.resolve.alias[`@/app/${action}`] = proxyPath;
        config.resolve.alias[path.resolve(__dirname, `src/app/${action}`)] = proxyPath;
      });
    }
    return config;
  }
};

export default nextConfig;
