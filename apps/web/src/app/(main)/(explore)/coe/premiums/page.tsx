import { FunFactsPqpSection } from "@web/app/(main)/(explore)/coe/premiums/components/fun-facts-pqp-section";
import { KeyInsightsSection } from "@web/app/(main)/(explore)/coe/premiums/components/key-insights-section";
import { LatestResultsSection } from "@web/app/(main)/(explore)/coe/premiums/components/latest-results-section";
import { PremiumRangesSection } from "@web/app/(main)/(explore)/coe/premiums/components/premium-ranges-section";
import { AnimatedSection } from "@web/app/(main)/(explore)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { Infobox } from "@web/components/shared/infobox";
import { PAGE_CONTEXTS } from "@web/components/shared/page-contexts";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { loadLastUpdated } from "@web/lib/common";
import { getLatestCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";
import { Suspense } from "react";

const title = "COE Premiums and Trends";
const description =
  "Certificate of Entitlement (COE) analysis hub for Singapore vehicle registration. View latest premiums, trends, and category-specific insights.";

export async function generateMetadata(): Promise<Metadata> {
  const results = await getLatestCoeResults();
  const categories = results.reduce<Record<string, number>>(
    (category, current) => {
      category[current.vehicleClass] = current.premium;
      return category;
    },
    {},
  );

  const images = `/api/og/coe?title=COE Overview&subtitle=Overview&biddingNo=2&categoryA=${categories["Category A"]}&categoryB=${categories["Category B"]}&categoryC=${categories["Category C"]}&categoryD=${categories["Category D"]}&categoryE=${categories["Category E"]}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/coe/premiums`,
      siteName: SITE_TITLE,
      locale: "en_SG",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
      images,
    },
    alternates: {
      canonical: "/coe/premiums",
    },
    authors: [{ name: SITE_TITLE, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
  };
}

export default function COEOverviewPage() {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="COE Overview"
            subtitle="Latest Certificate of Entitlement bidding results and premium trends."
          />
        }
        meta={
          <Suspense fallback={<SkeletonCard className="h-8 w-28" />}>
            <COEOverviewHeaderMeta />
          </Suspense>
        }
      />

      <AnimatedSection order={1}>
        <Infobox {...PAGE_CONTEXTS.coe} />
      </AnimatedSection>

      <AnimatedSection order={2}>
        <LatestResultsSection />
      </AnimatedSection>

      <AnimatedSection order={3}>
        <KeyInsightsSection />
      </AnimatedSection>

      <AnimatedSection order={4}>
        <FunFactsPqpSection />
      </AnimatedSection>

      <AnimatedSection order={5}>
        <PremiumRangesSection />
      </AnimatedSection>
    </div>
  );
}

async function COEOverviewHeaderMeta() {
  const lastUpdated = await loadLastUpdated("coe");

  return <DashboardPageMeta lastUpdated={lastUpdated} />;
}
