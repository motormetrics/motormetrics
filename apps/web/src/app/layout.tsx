import { cn } from "@heroui/react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@web/app/providers";
import LoadingIndicator from "@web/components/loading-indicator";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@web/config";
import { BotIdClient } from "botid/client";
import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, Suspense } from "react";
import "./globals.css";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";

// Urbanist is the single family across the app, per the design system.
// Exposed as a CSS variable so globals.css can map --font-sans onto it.
const urbanist = Urbanist({
  subsets: ["latin"],
  variable: "--font-urbanist",
});

const title = `${SITE_TITLE} (formerly SG Cars Trends)`;
const description = SITE_DESCRIPTION;
const url = new URL(SITE_URL);
const protectedRoutes = [
  {
    path: "/api/auth/:path*",
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
      className={cn("scroll-smooth antialiased", urbanist.variable)}
    >
      <head>
        <BotIdClient protect={protectedRoutes} />
      </head>
      <body className="bg-background text-foreground">
        <Providers>
          <NuqsAdapter>
            <Suspense fallback={null}>
              <LoadingIndicator />
            </Suspense>
            {children}
          </NuqsAdapter>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
};

export default RootLayout;
