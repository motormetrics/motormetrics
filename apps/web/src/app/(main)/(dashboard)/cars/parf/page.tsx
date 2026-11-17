import { PARFCalculator } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-calculator";
import { OverviewPage, SectionLink } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { generateBreadcrumbSchema } from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import type { Metadata } from "next";
import type { WebPage, WithContext } from "schema-dts";

const title = "PARF & COE Rebate Calculator: Estimate Deregistration Value";
const description =
  "Enter ARF, car age and COE left to estimate your PARF rebate, COE rebate and deregistration value under old and Budget 2026 rates. No login needed.";
export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    ...baseOpenGraph,
    title,
    description,
    url: `${SITE_URL}/cars/parf`,
  },
  twitter: {
    ...baseTwitter,
    title,
    description,
  },
  alternates: {
    canonical: "/cars/parf",
  },
};

const structuredData: WithContext<WebPage> = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  description,
  url: `${SITE_URL}/cars/parf`,
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
};

export default function PARFCalculatorPage() {
  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "PARF", path: "/cars/parf" },
          ]),
        }}
      />

      <PageToolbar
        actions={<SharePill title="PARF and COE rebate calculator" />}
        asOf="Budget 2026 rebate schedule, from the 2nd bidding exercise, February 2026 · Source: LTA"
        title="PARF and COE rebate calculator"
      />

      <PARFCalculator />

      <nav aria-label="Related" className="flex flex-wrap gap-x-6 gap-y-2">
        <SectionLink className="ml-0" href="/learn/check-parf-rebate">
          Check your PARF rebate on OneMotoring
        </SectionLink>
        <SectionLink className="ml-0" href="/learn/parf">
          PARF guide
        </SectionLink>
        <SectionLink
          className="ml-0"
          href="https://www.lta.gov.sg/content/ltagov/en/newsroom/2026/2/news-releases/revision-parf-rebate-schedule-cap.html"
          rel="noopener noreferrer nofollow"
        >
          LTA announcement
        </SectionLink>
        <SectionLink className="ml-0" href="/cars/arf">
          ARF calculator
        </SectionLink>
        <SectionLink className="ml-0" href="/coe/pqp">
          PQP renewal rates
        </SectionLink>
        <SectionLink className="ml-0" href="/coe/results">
          COE premiums
        </SectionLink>
      </nav>
    </OverviewPage>
  );
}
