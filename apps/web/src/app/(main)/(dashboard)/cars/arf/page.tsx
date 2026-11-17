import { ARFCalculator } from "@web/app/(main)/(dashboard)/cars/arf/components/arf-calculator";
import { OverviewPage, SectionLink } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";

const title = "ARF Calculator Singapore";
const description =
  "Calculate the Additional Registration Fee (ARF) on a car from its OMV, band by band, using LTA's current tiers or the earlier schedules.";
export function generateMetadata(): Metadata {
  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      url: `${SITE_URL}/cars/arf`,
    },
    twitter: {
      ...baseTwitter,
      title,
      description,
    },
    alternates: {
      canonical: "/cars/arf",
    },
  };
}

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: `${SITE_URL}/cars/arf`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

export default function ARFCalculatorPage() {
  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "ARF", path: "/cars/arf" },
          ]),
        }}
      />

      <PageToolbar
        actions={<SharePill title="ARF calculator" />}
        asOf="Current tiers apply to COEs from the 2nd bidding exercise, February 2023 · Source: LTA"
        title="ARF calculator"
      />

      <ARFCalculator />

      <nav aria-label="Related" className="flex flex-wrap gap-x-6 gap-y-2">
        <SectionLink className="ml-0" href="/learn/arf">
          ARF guide
        </SectionLink>
        <SectionLink
          className="ml-0"
          href="https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/upfront-vehicle-costs/tax-structure.html"
          rel="noopener noreferrer nofollow"
        >
          LTA tax structure
        </SectionLink>
        <SectionLink className="ml-0" href="/cars/parf">
          PARF calculator
        </SectionLink>
        <SectionLink className="ml-0" href="/coe/results">
          COE premiums
        </SectionLink>
      </nav>
    </OverviewPage>
  );
}
