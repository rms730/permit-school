const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { forceSwcTransforms: true },
  output: "standalone",
};

const sentryWebpackPluginOptions = {
  silent: true,
  org: "permit-school",
  project: "permit-school-web",
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions);
