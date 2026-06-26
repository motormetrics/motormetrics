import { cn } from "@heroui/theme";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Providers } from "@web/app/providers";
import LoadingIndicator from "@web/components/loading-indicator";
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { BotIdClient } from "botid/client";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
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
    title,
    description,
    images: [
      {
        url: `${SITE_URL}/opengraph-image.png`,
        width: 1200,
        height: 630,
        alt: `${SITE_TITLE} - Singapore Car Registration Statistics`,
      },
    ],
    url,
    siteName: title,
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [`${SITE_URL}/twitter-image.png`],
    site: SOCIAL_HANDLE,
    creator: SOCIAL_HANDLE,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  return (
    <html
      lang="en"
      className={cn("scroll-smooth antialiased", geistSans.className)}
    >
      <head>
        <BotIdClient protect={protectedRoutes} />
      </head>
      <body className="bg-background">
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
