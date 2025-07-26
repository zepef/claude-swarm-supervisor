import type { NextConfig } from 'next';
import type { Configuration } from 'webpack';

const nextConfig: NextConfig = {
  webpack: (config: Configuration) => {
    if (!config.resolve) {
      config.resolve = {};
    }
    config.resolve.fallback = {
      ...(config.resolve.fallback || {}),
      fs: false,
      child_process: false
    };
    return config;
  },
  turbopack: {
    resolveAlias: {
      fs: { browser: './src/lib/empty.js' },
      child_process: { browser: './src/lib/empty.js' }
    }
  }
};

export default nextConfig;