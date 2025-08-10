/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { forceSwcTransforms: true },
  output: 'standalone'
};

module.exports = nextConfig;
