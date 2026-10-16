import { withBotId } from "botid/next/config";
import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const LEGACY_DOMAIN_REDIRECTS = [
  ["sgcarstrends.com", "motormetrics.app"],
  ["www.sgcarstrends.com", "motormetrics.app"],
  ["docs.sgcarstrends.com", "docs.motormetrics.app"],
  ["api.sgcarstrends.com", "api.motormetrics.app"],
] as const;

// Removed or renamed pages that still hold search impressions; each points at
// the closest page that replaced it.
const LEGACY_PATH_REDIRECTS = [
  ["/coe/trends", "/coe/results"],
  ["/coe/bidding", "/coe"],
  ["/cars/costs", "/cars/arf"],
  ["/blog/understanding-coe-system-singapore", "/learn/coe"],
  [
    "/blog/electric-vehicles-dominate-singapore-market-february-2026",
    "/blog/electric-vehicles-capture-majority-share-in-february-2026",
  ],
  [
    "/blog/electric-vehicles-lead-singapore-market-october-2025",
    "/blog/electric-vehicles-dominate-singapore-october-2025",
  ],
  [
    "/blog/singapores-automotive-pulse-unpacking-october-2025-car-registration-trends",
    "/blog/electric-vehicles-dominate-singapore-october-2025",
  ],
  [
    "/blog/singapores-car-market-august-2025-analysis",
    "/blog/electric-vehicles-surge-in-singapore-august-2025",
  ],
] as const;

// Static CSP, not nonce-based: a nonce needs a per-request render, which
// would pull every page out of the static shell. vercel.live and pusher
// serve the preview toolbar; cartocdn serves the EV charging map's styles,
// tiles and glyphs.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://vercel.live",
  "style-src 'self' 'unsafe-inline' https://vercel.live",
  "img-src 'self' blob: data: https://assets.motormetrics.app https://*.blob.vercel-storage.com https://images.unsplash.com https://*.basemaps.cartocdn.com https://vercel.live https://vercel.com",
  "font-src 'self' data: https://vercel.live https://assets.vercel.com",
  "connect-src 'self' https://basemaps.cartocdn.com https://*.basemaps.cartocdn.com https://vercel.live wss://ws-us3.pusher.com",
  "worker-src 'self' blob:",
  "frame-src https://vercel.live",
  "frame-ancestors 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.motormetrics.app",
        pathname: "/logos/**",
      },
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com",
        pathname: "/logos/**",
      },
      {
        protocol: "https",
        hostname: "**.blob.vercel-storage.com",
        pathname: "/posts/hero/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
    browserToTerminal: "warn",
  },
  experimental: {
    mcpServer: true,
    turbopackFileSystemCacheForBuild: true,
    turbopackGc: true,
    turbopackLazyDynamicImports: true,
    turbopackRustReactCompiler: true,
    typedEnv: true,
  },
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      ...LEGACY_DOMAIN_REDIRECTS.map(([fromHost, toHost]) => ({
        source: "/:path*",
        has: [{ type: "host" as const, value: fromHost }],
        destination: `https://${toHost}/:path*`,
        permanent: true,
      })),
      ...LEGACY_PATH_REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      {
        source: "/instagram",
        destination: "https://www.instagram.com/motormetrics",
        permanent: false,
      },
      {
        source: "/telegram",
        destination: "https://t.me/motormetrics",
        permanent: false,
      },
      {
        source: "/github",
        destination: "https://github.com/motormetrics",
        permanent: false,
      },
      {
        source: "/x",
        destination: "https://x.com/motormetricsapp",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "api.motormetrics.app" }],
        destination: "/api/v1/:path*",
      },
      {
        source: "/ingest/static/:path*",
        destination: "https://eu-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/array/:path*",
        destination: "https://eu-assets.i.posthog.com/array/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://eu.i.posthog.com/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Content-Security-Policy",
            value: CONTENT_SECURITY_POLICY,
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default withWorkflow(withBotId(nextConfig));
