import { cn } from "@heroui/react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@web/app/providers";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@web/config";
import { BotIdClient } from "botid/client";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import "./globals.css";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";

// Inter is the single family across the app, per the HeroUI design system.
// The wordmark is outlined Urbanist, so the logo keeps its face without the
// site loading a second font. Exposed as a CSS variable so globals.css can map
// --font-sans onto it.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const title = `${SITE_TITLE} (formerly SG Cars Trends)`;
const description = SITE_DESCRIPTION;
const url = new URL(SITE_URL);
const protectedRoutes = [
  {
    // BotID matches `*` wildcards only; `:path*` would be taken literally.
    path: "/api/auth/*",
    method: "POST",
    advancedOptions: {
      checkLevel: "basic" as const,
    },
  },
];

export const metadata: Metadata = {
  metadataBase: url,
  title: {
    template: `%s - ${SITE_TITLE}`,
    default: title,
  },
  description,
  authors: [{ name: SITE_TITLE, url: SITE_URL }],
  creator: SITE_TITLE,
  publisher: SITE_TITLE,
  category: "Automotive Statistics",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const RootLayout = ({ children }: { children: ReactNode }) => {
  return (
    <html
      lang="en"
      className={cn(
        "glass-light antialiased motion-safe:scroll-smooth",
        inter.variable,
      )}
      data-scroll-behavior="smooth"
    >
      <head>
        <BotIdClient protect={protectedRoutes} />
      </head>
      <body className="bg-background text-foreground">
        <Providers>
          <NuqsAdapter>{children}</NuqsAdapter>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
