import { redis, slugify } from "@motormetrics/utils";
import { MakeDetail } from "@web/app/(main)/(explore)/cars/components/makes/make-detail";
import { AnimatedSection } from "@web/app/(main)/(explore)/components/animated-section";
import { DashboardPageHeader } from "@web/components/dashboard-page-header";
import { DashboardPageMeta } from "@web/components/dashboard-page-meta";
import { DashboardPageTitle } from "@web/components/dashboard-page-title";
import { MonthSelector } from "@web/components/shared/month-selector";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { LAST_UPDATED_CARS_KEY, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import {
  createWebPageStructuredData,
  generateBreadcrumbSchema,
} from "@web/lib/metadata";
import { getDistinctMakes } from "@web/queries/cars";
import { getMakeCoeComparison } from "@web/queries/cars/makes/coe-comparison";
import {
  getMakeDetails,
  getMakeMonthlyTotals,
} from "@web/queries/cars/makes/entity-breakdowns";
import { getMakeFromSlug } from "@web/queries/cars/makes/get-make-from-slug";
import { getCarLogo } from "@web/queries/logos";
import type { Make } from "@web/types";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";
import { loadSearchParams } from "./search-params";

interface PageProps {
  params: Promise<{ make: Make }>;
  searchParams: Promise<SearchParams>;
}

export async function generateStaticParams() {
  const makes = await getDistinctMakes();
  const params = makes.map(({ make }) => ({ make: slugify(make) }));

  return params.length > 0 ? params : [{ make: "__static-validation__" }];
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { make } = await params;

  const exactMake = await getMakeFromSlug(make);
  if (!exactMake) {
    return {
      title: "Car Make Not Found",
      description: "The requested car make could not be found.",
      alternates: { canonical: `/cars/makes/${make}` },
    };
  }

  const title = `${exactMake} Cars in Singapore`;
  const description = `${exactMake} cars overview. Historical car registration trends and monthly breakdown by fuel and vehicle types in Singapore.`;
  const images = `/api/og?title=${exactMake}&subtitle=Stats by Make`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/cars/makes/${make}`,
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
      canonical: `/cars/makes/${make}`,
    },
  };
}

export default async function CarMakePage({
  params,
  searchParams: searchParamsPromise,
}: PageProps) {
  return (
    <div className="flex flex-col gap-4">
      <DashboardPageHeader
        title={
          <DashboardPageTitle
            title="Make Overview"
            subtitle="Historical car registration trends and monthly breakdown by fuel and vehicle types in Singapore."
          />
        }
        meta={
          <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
            <CarMakeHeaderMeta
              params={params}
              searchParams={searchParamsPromise}
            />
          </Suspense>
        }
      />

      <AnimatedSection order={1}>
        <Suspense fallback={<SkeletonCard className="h-10 w-40" />}>
          <CarMakeContent params={params} searchParams={searchParamsPromise} />
        </Suspense>
      </AnimatedSection>
    </div>
  );
}

async function CarMakeHeaderMeta({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ make: Make }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ make }, { month: parsedMonth }, months, lastUpdated] =
    await Promise.all([
      paramsPromise,
      loadSearchParams(searchParamsPromise),
      fetchMonthsForCars(),
      redis.get<number>(LAST_UPDATED_CARS_KEY),
    ]);
  const { wasAdjusted } = await getMonthOrLatest(parsedMonth, "cars");

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

async function CarMakeContent({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: {
  params: Promise<{ make: Make }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ make }, { month: parsedMonth }] = await Promise.all([
    paramsPromise,
    loadSearchParams(searchParamsPromise),
  ]);

  const exactMake = await getMakeFromSlug(make);
  if (!exactMake) {
    return notFound();
  }

  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const [coeComparison, makeDetails, monthlyTotals, logo] = await Promise.all([
    getMakeCoeComparison(exactMake),
    getMakeDetails(exactMake, month),
    getMakeMonthlyTotals(exactMake),
    getCarLogo(exactMake),
  ]);

  // Derive breakdowns from makeDetails.data to avoid 2 extra DB queries.
  // makeDetails.data contains rows grouped by (month, fuelType, vehicleType) with a `count` field.
  type MakeRow = {
    fuelType?: string | null;
    vehicleType?: string | null;
    count?: number;
  };
  const fuelTypeMap = new Map<string, number>();
  const vehicleTypeMap = new Map<string, number>();
  for (const row of makeDetails.data as MakeRow[]) {
    if (row.fuelType) {
      fuelTypeMap.set(
        row.fuelType,
        (fuelTypeMap.get(row.fuelType) ?? 0) + (row.count ?? 0),
      );
    }
    if (row.vehicleType) {
      vehicleTypeMap.set(
        row.vehicleType,
        (vehicleTypeMap.get(row.vehicleType) ?? 0) + (row.count ?? 0),
      );
    }
  }
  const fuelTypeBreakdown = Array.from(fuelTypeMap, ([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);
  const vehicleTypeBreakdown = Array.from(vehicleTypeMap, ([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value);

  const cars = {
    make: exactMake,
    total: monthlyTotals.reduce((sum, row) => sum + row.count, 0),
    monthTotal: makeDetails.total,
    data: makeDetails.data,
    historicalData: monthlyTotals,
    monthsTracked: monthlyTotals.length,
  };

  const title = `${exactMake} Cars in Singapore`;
  const description = `${exactMake} cars overview. Historical car registration trends and monthly breakdown by fuel and vehicle types in Singapore.`;
  const structuredData = createWebPageStructuredData(
    title,
    description,
    `/cars/makes/${make}`,
  );

  return (
    <>
      <StructuredData data={structuredData} />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Makes", path: "/cars/makes" },
            { name: exactMake, path: `/cars/makes/${make}` },
          ]),
        }}
      />
      <Suspense fallback={<SkeletonCard className="h-[560px] w-full" />}>
        <MakeDetail
          cars={cars}
          coeComparison={coeComparison}
          logo={logo}
          fuelTypeBreakdown={fuelTypeBreakdown}
          vehicleTypeBreakdown={vehicleTypeBreakdown}
        />
      </Suspense>
    </>
  );
}
