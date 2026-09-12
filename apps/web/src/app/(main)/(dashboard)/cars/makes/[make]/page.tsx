import { Skeleton } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      site: SOCIAL_HANDLE,
      creator: SOCIAL_HANDLE,
    },
    alternates: {
      canonical: `/cars/makes/${make}`,
    },
  };
}

/**
 * Resolve the URL slug to the exact DB make name, 404ing on an unknown slug.
 *
 * Called per region rather than once at the top of the page. `params` is URL
 * data, so awaiting it in the page component takes the whole route out of the
 * static shell — including on a client navigation between makes. Each region
 * resolving it behind its own boundary is what keeps the shell. It is not a
 * repeated lookup: `getMakeFromSlug` is `'use cache'`, so the first call
 * populates and the rest read it.
 */
async function resolveMake(params: PageProps["params"]) {
  const { make } = await params;
  const exactMake = await getMakeFromSlug(make);

  if (!exactMake) {
    notFound();
  }

  return { exactMake, make };
}

/** Stands in for `PageHead` while the make name resolves. */
function MakeHeadSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex max-w-prose flex-col gap-2">
        <Skeleton className="h-12 w-64 rounded-lg" />
        <Skeleton className="h-5 w-full rounded-lg" />
      </div>
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3 sm:ml-auto">
        <Skeleton className="h-10 w-80 rounded-full" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
    </div>
  );
}

export default function CarMakePage({
  params,
  searchParams: searchParamsPromise,
}: PageProps) {
  return (
    <Report>
      <Suspense fallback={null}>
        <MakeStructuredData params={params} />
      </Suspense>

      <Suspense fallback={<MakeHeadSkeleton />}>
        <MakeHead params={params} searchParams={searchParamsPromise} />
      </Suspense>

      <SectionErrorBoundary title="Make data unavailable">
        <Suspense fallback={<SkeletonCard className="h-[900px] w-full" />}>
          <MakeReportSection
            params={params}
            searchParams={searchParamsPromise}
          />
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
            <CarMakeCoeSection params={params} />
          </Suspense>
        </SectionErrorBoundary>
      </ReportSection>
    </Report>
  );
}

async function MakeStructuredData({ params }: Pick<PageProps, "params">) {
  const { exactMake, make } = await resolveMake(params);

  const title = `${exactMake} Cars in Singapore`;
  const description = `${exactMake} cars overview. Historical car registration trends and monthly breakdown by fuel and vehicle types in Singapore.`;

  return (
    <>
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
    </>
  );
}

/**
 * The make-name H1. `PageHead` derives the share pill from its title, so the
 * whole head resolves together rather than splitting the string out.
 */
async function MakeHead({ params, searchParams }: PageProps) {
  const { exactMake } = await resolveMake(params);

  return (
    <PageHead
      controls={
        // Nested on purpose: the month and make pickers fetch data of their
        // own, so the H1 lands as soon as the slug resolves instead of
        // waiting on them.
        <Suspense fallback={<SkeletonCard className="h-10 w-80" />}>
          <CarMakeHeaderMeta searchParams={searchParams} />
        </Suspense>
      }
      description={`${exactMake} registrations in Singapore, broken down by fuel type and vehicle type, month by month.`}
      title={exactMake}
    />
  );
}

async function MakeReportSection({ params, searchParams }: PageProps) {
  const { exactMake } = await resolveMake(params);

  return <MakeReport make={exactMake} searchParams={searchParams} />;
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

async function CarMakeCoeSection({ params }: Pick<PageProps, "params">) {
  const { exactMake } = await resolveMake(params);
  const coeComparison = await getMakeCoeComparison(exactMake);

  return <CoeComparisonChart data={coeComparison} />;
}
