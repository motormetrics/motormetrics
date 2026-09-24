import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { CarsMonthSelector } from "@web/app/(main)/(dashboard)/cars/components/cars-month-selector";
import { RegistrationsReport } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-report";
import { TrendsCompareButton } from "@web/app/(main)/(dashboard)/cars/registrations/components/trends-compare-button";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { PageHead } from "@web/components/shared/page-head";
import { Report, ReportSection } from "@web/components/shared/report";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getComparisonData } from "@web/queries/cars/compare";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const formattedMonth = formatDateToMonthYear(month);

  const title = "New Car Registrations in Singapore";
  const description = `${formattedMonth} new car registrations in Singapore from LTA data, by make, fuel type and vehicle type.`;

  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      title,
      description,
      url: `${SITE_URL}/cars/registrations`,
    },
    twitter: {
      ...baseTwitter,
      title,
      description,
    },
    alternates: {
      canonical: "/cars/registrations",
    },
    authors: [{ name: SITE_TITLE, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
  };
}

export default function Page({ searchParams }: PageProps) {
  return (
    <Report>
      <PageHead
        controls={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <CarsMonthSelector searchParams={searchParams} />
          </Suspense>
        }
        description="Every car registered in Singapore, counted in the month of registration — which can lag the bidding exercise that won its COE by several weeks."
        title="Car registrations"
      />

      <SectionErrorBoundary title="Registration data unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <RegistrationsReport searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>

      {/* The comp has no month-comparison block. Kept because it is working
          functionality rather than styling, and parked at the foot so it does
          not interrupt the report above it. */}
      <ReportSection
        caption="Pick two months to see how registrations moved between them"
        title="Compare months"
      >
        <SectionErrorBoundary title="Comparison unavailable">
          <Suspense fallback={<SkeletonCard className="h-12 w-52" />}>
            <CarsCompareSection searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>
      </ReportSection>
    </Report>
  );
}

async function CarsCompareSection({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    month: parsedMonth,
    compareA,
    compareB,
  } = await loadSearchParams(searchParams);
  const [months, { month }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  const comparisonData =
    (compareA && compareB && (await getComparisonData(compareA, compareB))) ||
    false;

  return (
    <TrendsCompareButton
      currentMonth={month}
      months={months}
      comparisonData={comparisonData}
    />
  );
}
