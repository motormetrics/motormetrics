import { slugify } from "@motormetrics/utils";
import { CoeComparisonChart } from "@web/app/(main)/(dashboard)/cars/components/makes/coe-comparison-chart";
import { MakeSearch } from "@web/app/(main)/(dashboard)/cars/components/makes/make-search";
import { MakeReport } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MonthSelector } from "@web/components/shared/month-selector";
import { PageHead } from "@web/components/shared/page-head";
import { Report, ReportSection } from "@web/components/shared/report";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { StructuredData } from "@web/components/structured-data";
import { SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_HANDLE } from "@web/config/socials";
import {
  createWebPageStructuredData,
  generateBreadcrumbSchema,
} from "@web/lib/metadata";
import { getDistinctMakes } from "@web/queries/cars";
import { getMakeCoeComparison } from "@web/queries/cars/makes/coe-comparison";
import { getMakeFromSlug } from "@web/queries/cars/makes/get-make-from-slug";
import type { Make } from "@web/types";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

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
  // Resolved here rather than threaded down so the comp's make-name headline is
  // the H1. Every make is prerendered by `generateStaticParams`, so this awaits
  // at build rather than per request.
  const { make } = await params;
  const exactMake = await getMakeFromSlug(make);

  if (!exactMake) {
    return notFound();
  }

  const title = `${exactMake} Cars in Singapore`;
  const description = `${exactMake} cars overview. Historical car registration trends and monthly breakdown by fuel and vehicle types in Singapore.`;

  return (
    <Report>
      <StructuredData
        data={createWebPageStructuredData(
          title,
          description,
          `/cars/makes/${make}`,
        )}
      />
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

      <PageHead
        controls={
          <Suspense fallback={<SkeletonCard className="h-10 w-80" />}>
            <CarMakeHeaderMeta searchParams={searchParamsPromise} />
          </Suspense>
        }
        description={`${exactMake} registrations in Singapore, broken down by fuel type and vehicle type, month by month.`}
        title={exactMake}
      />

      <SectionErrorBoundary title="Make data unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <MakeReport make={exactMake} searchParams={searchParamsPromise} />
        </Suspense>
      </SectionErrorBoundary>

      {/* The comp has no COE block. Kept because it is working functionality
          rather than styling, and parked at the foot so it does not interrupt
          the report above it. */}
      <ReportSection
        caption="Bars are monthly registrations; lines are the Category A and B premiums"
        title="Registrations against COE premiums"
      >
        <SectionErrorBoundary title="COE comparison unavailable">
          <Suspense fallback={<SkeletonCard className="h-[300px] w-full" />}>
            <CarMakeCoeSection make={exactMake} />
          </Suspense>
        </SectionErrorBoundary>
      </ReportSection>
    </Report>
  );
}

async function CarMakeHeaderMeta({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ month: parsedMonth }, months, makes] = await Promise.all([
    loadSearchParams(searchParamsPromise),
    fetchMonthsForCars(),
    getDistinctMakes(),
  ]);
  const { wasAdjusted } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <>
      {/* The comp hangs a make picker off the H1 itself. `PageHead` takes a
          plain string title, so it sits in the controls slot beside the month
          picker instead. */}
      <MakeSearch makes={makes.map(({ make }) => make)} />
      <MonthSelector
        latestMonth={months[0]}
        months={months}
        wasAdjusted={wasAdjusted}
      />
    </>
  );
}

async function CarMakeCoeSection({ make }: { make: string }) {
  const coeComparison = await getMakeCoeComparison(make);

  return <CoeComparisonChart data={coeComparison} />;
}
