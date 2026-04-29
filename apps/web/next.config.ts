import type { NextConfig } from "next";
import { withWorkflow } from "workflow/next";

const ONE_DAY = 60 * 60 * 24;

const LEGACY_DOMAIN_REDIRECTS = [
  ["sgcarstrends.com", "motormetrics.app"],
  ["www.sgcarstrends.com", "motormetrics.app"],
  ["staging.sgcarstrends.com", "staging.motormetrics.app"],
  ["docs.sgcarstrends.com", "docs.motormetrics.app"],
  ["api.sgcarstrends.com", "api.motormetrics.app"],
] as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  cacheComponents: true,
  cacheLife: {
    max: {
      stale: ONE_DAY * 30,
      revalidate: ONE_DAY * 30,
      expire: ONE_DAY * 365,
    },
  },
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
    browserToTerminal: true,
  },
  transpilePackages: ["@motormetrics/ui"],
  experimental: {
    mcpServer: true,
    turbopackFileSystemCacheForBuild: true,
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
            value: "origin-when-cross-origin",
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

export default withWorkflow(nextConfig);
