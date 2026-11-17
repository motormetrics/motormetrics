import { Skeleton } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { CarsMonthPicker } from "@web/app/(main)/(dashboard)/cars/components/cars-month-picker";
import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/registrations/components/filters";
import {
  FuelPeriod,
  FuelTable,
  RegistrationsAsOf,
  RegistrationsKpis,
  ReportFuelMenu,
  TrendChart,
  TrendPeriod,
  TrendTitle,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-report";
import { TrendsCompareButton } from "@web/app/(main)/(dashboard)/cars/registrations/components/trends-compare-button";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { FigureCard } from "@web/components/shared/figure-card";
import { OverviewPage } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getComparisonData } from "@web/queries/cars/compare";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import type { SearchParams } from "nuqs/server";
import { type ReactNode, Suspense } from "react";

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

/** A line of text that follows the search params, held open by a space. */
function Slot({ children }: { children: ReactNode }) {
  return <Suspense fallback={" "}>{children}</Suspense>;
}

export default function Page({ searchParams }: PageProps) {
  const props = { searchParams };

  return (
    // The dashboard template: a toolbar with the month and fuel filters, four
    // KPI tiles, the monthly chart and the fuel type table. The title and
    // "LTA data to" line are in the static shell; everything that follows the
    // search params streams in behind its own boundary.
    <OverviewPage className="gap-8 max-md:gap-6">
      <PageToolbar
        actions={
          <>
            <Suspense fallback={<Skeleton className="h-10 w-36" />}>
              <CarsMonthPicker searchParams={searchParams} />
            </Suspense>
            <Suspense fallback={<Skeleton className="h-10 w-36" />}>
              <ReportFuelMenu />
            </Suspense>
            <SectionErrorBoundary title="Comparison unavailable">
              <Suspense fallback={<Skeleton className="h-8 w-36" />}>
                <CarsCompare searchParams={searchParams} />
              </Suspense>
            </SectionErrorBoundary>
            <SharePill title="Car registrations" />
          </>
        }
        asOf={<RegistrationsAsOf />}
        title="Car registrations"
      />

      <SectionErrorBoundary title="Key numbers unavailable">
        <Suspense fallback={<Skeleton className="h-40 w-full rounded-3xl" />}>
          <RegistrationsKpis {...props} />
        </Suspense>
      </SectionErrorBoundary>

      <FigureCard
        description={
          <Slot>
            <TrendPeriod {...props} />
          </Slot>
        }
        title={
          <Suspense fallback="Registrations by month">
            <TrendTitle {...props} />
          </Suspense>
        }
        trailing={
          <Suspense fallback={<Skeleton className="h-8 w-32" />}>
            <RangeTabs />
          </Suspense>
        }
      >
        <SectionErrorBoundary title="Registration trend unavailable">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <TrendChart {...props} />
          </Suspense>
        </SectionErrorBoundary>
      </FigureCard>

      <FigureCard
        description={
          <Slot>
            <FuelPeriod {...props} />
          </Slot>
        }
        title="By fuel type"
      >
        <SectionErrorBoundary title="Fuel types unavailable">
          <Suspense fallback={<Skeleton className="h-64 w-full" />}>
            <FuelTable {...props} />
          </Suspense>
        </SectionErrorBoundary>
      </FigureCard>
    </OverviewPage>
  );
}

/** The month comparison drawer, opened from the toolbar. */
async function CarsCompare({
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
    compareA && compareB ? await getComparisonData(compareA, compareB) : false;

  return (
    <TrendsCompareButton
      currentMonth={month}
      months={months}
      comparisonData={comparisonData}
    />
  );
}
