import { AudienceSection } from "@web/app/(main)/(site)/advertise/components/audience-section";
import { CtaSection } from "@web/app/(main)/(site)/advertise/components/cta-section";
import { HeroSection } from "@web/app/(main)/(site)/advertise/components/hero-section";
import { PlacementsSection } from "@web/app/(main)/(site)/advertise/components/placements-section";
import { PricingSection } from "@web/app/(main)/(site)/advertise/components/pricing-section";
import { StatsSection } from "@web/app/(main)/(site)/advertise/components/stats-section";
import { TrafficChartSection } from "@web/app/(main)/(site)/advertise/components/traffic-chart-section";
import { SitePage } from "@web/components/shared/site-page";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { advertisePage } from "@web/flags";
import { getDailyTraffic, getTrafficStats } from "@web/lib/posthog";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { WebPage, WithContext } from "schema-dts";

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

// The flag is read per request, so the route opts out of the static shell.
export const instant = false;

export default async function AdvertisePage() {
  const showAdvertisePage = await advertisePage();
  if (!showAdvertisePage) {
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

      <SitePage>
        <HeroSection />
        <StatsSection stats={stats} />
        <TrafficChartSection data={dailyTraffic} />
        <AudienceSection />
        <PlacementsSection />
        <PricingSection />
        <CtaSection />
      </SitePage>
    </>
  );
}
