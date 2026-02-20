import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent these packages from being bundled by Next.js/Webpack
  // They should be treated as external dependencies (Node.js runtime)
  serverExternalPackages: [
    '@remotion/bundler',
    '@remotion/renderer',
    'remotion',
    'esbuild'
  ],
};

export default nextConfig;
