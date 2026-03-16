import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Core Next.js configuration for the frontend application.
 *
 * @see {@link https://nextjs.org/docs/app/api-reference/config/next-config-js/reactCompiler} for React Compiler docs.
 * @see {@link https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents} for Cache Components docs.
 * @see {@link https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheHandlers} for Cache Handlers docs.
 * @see {@link https://nextjs.org/blog/next-16-beta} for Turbopack FS cache docs.
 * @see {@link https://nextjs.org/docs/app/api-reference/config/next-config-js/productionBrowserSourceMaps} for Production Browser Source Maps docs.
 * @see {@link https://nextjs.org/docs/app/api-reference/config/next-config-js/typescript} for TypeScript strictness docs.
 */
const nextConfig: NextConfig = {
  // Core runtime / output:
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  // React Compiler (automatic memoization):
  reactCompiler: true,

  // Cache Components and named cacheLife profiles:
  cacheComponents: true,
  cacheLife: {
    // Student/teacher dashboards (fast, but not crazy):
    dashShort: { stale: 60, revalidate: 60, expire: 300 },

    // Heavier analytics dashboards:
    dashMedium: { stale: 300, revalidate: 300, expire: 1800 },

    // Near-realtime admin metrics:
    nearRealtime: { stale: 5, revalidate: 5, expire: 30 },

    // Generic "profile-ish" short-lived data:
    profileShort: { stale: 300, revalidate: 300, expire: 1800 },
  },

  // Turbopack FS cache to speed up dev restarts (build cache left off by default):
  experimental: {
    turbopackFileSystemCacheForDev: true,
    // Necesario para poder usar forbidden() y unauthorized()
    authInterrupts: true,
  },

  // Don’t ship source maps to browsers in prod:
  productionBrowserSourceMaps: false,

  // Dev-only CORS relaxations for local testing with the backend:
  allowedDevOrigins: ['localhost', '127.0.0.1'],

  // Dev-only extra logging from Next itself (prod logs are served via Pino + OTel):
  logging: isProd
    ? false
    : {
        fetches: {
          fullUrl: true,
          hmrRefreshes: true,
        },
        incomingRequests: {
          // Don’t spam console with asset noise:
          ignore: [/^\/_next\//],
        },
      },

  // Be strict with types: frontend builds must fail on TS errors:
  typescript: {
    ignoreBuildErrors: false,
  },

  // Allow Next.js Image to load from MinIO (dev + prod hostnames):
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
    ],
  },

  // Monorepo-consumed packages to be transpiled by Next.js:
  // transpilePackages: [
  //   '@kotrip/data',
  // ],
};

/**
 * Next-Intl plugin to wrap the Next.js config with i18n support.
 *
 * @see {@link https://next-intl.dev/docs/getting-started} for general setup.
 * @see {@link https://next-intl.dev/docs/getting-started/app-router} for more details on App Router integration.
 * @see {@link https://github.com/amannn/next-intl/issues/1832} for the experimental typegen hook.
 */
const withNextIntl = createNextIntlPlugin({
  requestConfig: './src/features/i18n/request.ts',
  // Typegen for messages: treat one locale as canonical and generate declarations from it:
  experimental: {
    createMessagesDeclaration: './src/features/i18n/messages/es.json',
  },
});

export default withNextIntl(nextConfig);
