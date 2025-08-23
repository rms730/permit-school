const withNextIntl = require('next-intl/plugin')('./i18n/request.ts');
// Temporarily disable PWA to debug build issues
// const withPWA = require("next-pwa")({
//   dest: "public",
//   disable: process.env.NODE_ENV === "development",
//   register: true,
//   skipWaiting: true,
//   runtimeCaching: [
//     // Static assets - Cache First
//     {
//       urlPattern: /^https:\/\/.+\/_next\/static\/.*/i,
//       handler: "CacheFirst",
//       options: {
//         cacheName: "next-static",
//         expiration: {
//           maxEntries: 100,
//           maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
//         },
//       },
//     },
//     // Fonts - Cache First
//     {
//       urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
//       handler: "CacheFirst",
//       options: {
//         cacheName: "google-fonts",
//         expiration: {
//           maxEntries: 10,
//           maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
//         },
//       },
//     },
//     // Icons and images - Cache First
//     {
//       urlPattern: /^https:\/\/.+\/icons\/.*/i,
//       handler: "CacheFirst",
//       options: {
//         cacheName: "icons",
//         expiration: {
//           maxEntries: 50,
//           maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
//         },
//       },
//     },
//     // Public pages - Stale While Revalidate
//     {
//       urlPattern: /^\/(courses|privacy|terms|verify\/.*|accessibility|offline)?$/i,
//       handler: "StaleWhileRevalidate",
//       options: {
//         cacheName: "pages-public",
//         expiration: {
//           maxEntries: 50,
//           maxAgeSeconds: 60 * 60 * 24, // 1 day
//         },
//       },
//     },
//     // Explicitly avoid caching for private/compliance routes - Network Only
//     {
//       urlPattern: /^\/(api|learn|quiz|exam|tutor|billing|admin|profile|dashboard|signin|signout|enroll|guardian)\/?.*/i,
//       handler: "NetworkOnly",
//     },
//   ],
// });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // experimental: { forceSwcTransforms: true }, // Temporarily disabled to fix MUI vendor chunk issue
  output: "standalone",
  // Disable static generation for pages that use React context
  trailingSlash: false,
  generateBuildId: async () => {
    return 'build-' + Date.now();
  },
  // Disable static generation entirely to avoid React context issues
  experimental: {
    // Disable static generation for pages that use context
    workerThreads: false,
    cpus: 1
  },
  // Set a reasonable timeout for static generation
  staticPageGenerationTimeout: 120,
  outputFileTracingRoot: __dirname,
  headers: async () => {
    return [
      // Disable static generation for API routes that use dynamic features
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, must-revalidate",
          },
        ],
      },
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Content-Type",
            value: "application/manifest+json",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

// Conditionally enable Sentry only when explicitly enabled and DSN is provided
let config = withNextIntl(nextConfig);

if (process.env.SENTRY_ENABLED === '1' && process.env.SENTRY_DSN) {
  const { withSentryConfig } = require("@sentry/nextjs");
  const sentryWebpackPluginOptions = {
    silent: true,
    org: "permit-school",
    project: "permit-school-web",
  };
  config = withSentryConfig(config, sentryWebpackPluginOptions);
}

module.exports = config;
