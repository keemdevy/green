import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@green/api-client', '@green/config', '@green/domain'],
};

export default nextConfig;
