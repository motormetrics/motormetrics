import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { advertiseFlags, advertisePage } from "@web/flags";
import { getDailyTraffic, getTrafficStats } from "@web/lib/posthog";
import { generatePermutations } from "flags/next";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { WebPage, WithContext } from "schema-dts";
import { CtaSection } from "../components/cta-section";
import { HeroSection } from "../components/hero-section";
import { PlacementsSection } from "../components/placements-section";
import { PricingSection } from "../components/pricing-section";
import { StatsSection } from "../components/stats-section";
import { TrafficChartSection } from "../components/traffic-chart-section";

const title = "Advertise";
const description = `Reach Singapore's most engaged car enthusiasts. See our traffic stats, ad placements, and pricing to promote your product on ${SITE_TITLE}.`;

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title: `${title} - ${SITE_TITLE}`,
    description,
    url: `${SITE_URL}/advertise`,
    siteName: SITE_TITLE,
    locale: "en_SG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${title} - ${SITE_TITLE}`,
    description,
    site: SOCIAL_HANDLE,
    creator: SOCIAL_HANDLE,
  },
  alternates: {
    canonical: "/advertise",
  },
  // Remove when page is ready to go live
  robots: { index: false, follow: false },
};

// `proxy.ts` rewrites /advertise to /advertise/<code>, where <code> carries the
// precomputed flag values. Prerendering every permutation keeps the page static.
export async function generateStaticParams() {
  const codes = await generatePermutations(advertiseFlags);

  return codes.map((code) => ({ code }));
}

export default async function AdvertisePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  if (!(await advertisePage(code, advertiseFlags))) {
    notFound();
  }
  const [stats, dailyTraffic] = await Promise.all([
    getTrafficStats(),
    getDailyTraffic(),
  ]);

  const webPageSchema: WithContext<WebPage> = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${title} - ${SITE_TITLE}`,
    description,
    url: `${SITE_URL}/advertise`,
    publisher: {
      "@type": "Organization",
      name: SITE_TITLE,
      url: SITE_URL,
    },
  };

  return (
    <>
      <StructuredData data={webPageSchema} />

      <div className="flex flex-col">
        <HeroSection />
        <StatsSection stats={stats} />
        <TrafficChartSection data={dailyTraffic} />
        <PlacementsSection />
        <PricingSection />
        <CtaSection />
      </div>
    </>
  );
}
