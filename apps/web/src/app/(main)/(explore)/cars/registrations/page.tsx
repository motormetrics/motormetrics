import { formatDateToMonthYear } from "@motormetrics/utils";
import { CategoryTabsSection } from "@web/app/(main)/(explore)/cars/registrations/components/category-tabs-section";
import { MetricCardsSection } from "@web/app/(main)/(explore)/cars/registrations/components/metric-cards-section";
import { TopMakesFuelSection } from "@web/app/(main)/(explore)/cars/registrations/components/top-makes-section";
import { loadSearchParams } from "@web/app/(main)/(explore)/cars/registrations/search-params";
import { TrendsCompareButton } from "@web/app/(main)/(explore)/cars/registrations/trends-compare-button";
import { AnimatedSection } from "@web/app/(main)/(explore)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { Infobox } from "@web/components/shared/infobox";
import { MonthSelector } from "@web/components/shared/month-selector";
import { PAGE_CONTEXTS } from "@web/components/shared/page-contexts";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import { loadCarsMetadataData } from "@web/lib/cars/page-data";
import { loadLastUpdated } from "@web/lib/common";
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

  const title = `${formattedMonth} Car Registrations`;
  const description = `Discover ${formattedMonth} car registrations in Singapore. See detailed stats by fuel type, vehicle type, and top brands.`;

  const { topTypes, carRegistration } = await loadCarsMetadataData(month);
  const images = `/api/og?title=Car Registrations&subtitle=Monthly Stats Summary&month=${month}&total=${carRegistration.total}&topFuelType=${topTypes.topFuelType.name}&topVehicleType=${topTypes.topVehicleType.name}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/cars/registrations?month=${month}`,
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
      canonical: `/cars/registrations?month=${month}`,
    },
    authors: [{ name: SITE_TITLE, url: SITE_URL }],
    creator: SITE_TITLE,
    publisher: SITE_TITLE,
  };
}

export default function Page({ searchParams }: PageProps) {
  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="Car Registrations"
            subtitle="Monthly new car registrations in Singapore by fuel type and vehicle type."
          />
        }
        meta={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <CarsPageHeaderMeta searchParams={searchParams} />
          </Suspense>
        }
      />

      <AnimatedSection order={1}>
        <Infobox {...PAGE_CONTEXTS.cars} />
      </AnimatedSection>

      <AnimatedSection order={2}>
        <Suspense fallback={<SkeletonCard className="h-12 w-52" />}>
          <CarsCompareSection searchParams={searchParams} />
        </Suspense>
      </AnimatedSection>

      <Suspense fallback={<SkeletonCard className="h-[720px] w-full" />}>
        <CarsPageSections searchParams={searchParams} />
      </Suspense>
    </div>
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

async function CarsPageSections({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <div className="flex flex-col gap-4">
      <AnimatedSection order={3}>
        <MetricCardsSection month={month} />
      </AnimatedSection>
      <AnimatedSection order={4}>
        <CategoryTabsSection month={month} />
      </AnimatedSection>
      <AnimatedSection order={5}>
        <TopMakesFuelSection month={month} />
      </AnimatedSection>
    </div>
  );
}

async function CarsPageHeaderMeta({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const [months, lastUpdated, { wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    loadLastUpdated("cars"),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  return (
    <DashboardPageMeta lastUpdated={lastUpdated}>
      <MonthSelector
        months={months}
        latestMonth={months[0]}
        wasAdjusted={wasAdjusted}
      />
    </DashboardPageMeta>
  );
}
