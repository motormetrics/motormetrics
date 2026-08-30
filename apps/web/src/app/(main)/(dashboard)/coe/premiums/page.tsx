import { PremiumsReport } from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-report";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthSelector } from "@web/components/shared/month-selector";
import { PageHead } from "@web/components/shared/page-head";
import { Report } from "@web/components/shared/report";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { getCoeMonths, getLatestCoeResults } from "@web/queries/coe";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

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

export default function COEPremiumsPage({ searchParams }: PageProps) {
  return (
    <Report>
      <PageHead
        controls={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <PremiumsHeaderMeta />
          </Suspense>
        }
        description="Quota premiums close at the end of every bidding exercise. Pick a category to see its full history, quota and bidding activity."
        title="COE premiums"
      />

      <SectionErrorBoundary title="COE premiums unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <PremiumsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
    </Report>
  );
}

async function PremiumsHeaderMeta() {
  const months = (await getCoeMonths()).map(({ month }) => month);

  return <MonthSelector latestMonth={months[0]} months={months} />;
}
