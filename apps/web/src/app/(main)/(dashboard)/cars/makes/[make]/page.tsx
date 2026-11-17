import { Skeleton } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import {
  MakeControls,
  MakeReport,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { summariseMake } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/summary";
import { ComparisonLinks } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import { pairsWithMake } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { OverviewPage } from "@web/components/shared/overview";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import {
  createWebPageStructuredData,
  generateBreadcrumbSchema,
} from "@web/lib/metadata";
import {
  baseOpenGraph,
  baseTwitter,
  makesCardImages,
} from "@web/lib/metadata/social";
import { getDistinctMakes } from "@web/queries/cars";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getMakeFromSlug } from "@web/queries/cars/makes/get-make-from-slug";
import {
  getMakeCrossTab,
  getMakeTotalsInRange,
  getMarketMonthlyTotals,
} from "@web/queries/cars/makes/period-totals";
import { getCarLogoMap } from "@web/queries/logos";
import type { Make } from "@web/types";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ make: Make }>;
  searchParams: Promise<SearchParams>;
}

/**
 * Prerender every make. A longer build is the cheaper side of the trade: a
 * make left out is rendered by a function on its first visit after every
 * deploy, which counts against Fluid Active CPU where build time does not.
 * `dynamicParams` stays at its default, so a make added between deploys is
 * still rendered on demand rather than a 404.
 */
export async function generateStaticParams() {
  const makes = await getDistinctMakes();
  const params = makes.map(({ make }) => ({ make: slugify(make) }));

  return params.length > 0 ? params : [{ make: "__static-validation__" }];
}

const makeTitle = (make: string) => `${make} Cars in Singapore`;

const makeDescription = (make: string) =>
  `${make} cars overview. Historical car registration trends and monthly breakdown by fuel and vehicle types in Singapore.`;

/**
 * The latest month's figures as the search snippet, in the sentence the page
 * already shows under the trend chart: "BMW registered 612 new cars in
 * September 2026 … 7,340 so far in 2026, the 2nd-most of any make." A snippet
 * that states the number is one a search engine or an assistant can quote. A
 * make with no registrations that month keeps the generic description.
 */
async function loadMakeDescription(make: string): Promise<string> {
  const summary = await loadMakeSummary(make);

  return summary ? `${summary} Source: LTA.` : makeDescription(make);
}

/** The latest month's summary sentence, for the search snippet. */
async function loadMakeSummary(make: string): Promise<string | undefined> {
  const month = await getCarsLatestMonth();
  if (!month) {
    return undefined;
  }

  const previousMonth = shiftMonth(month, -1);
  const [crossTab, yearTotals, marketMonthly] = await Promise.all([
    getMakeCrossTab(make),
    getMakeTotalsInRange(`${month.slice(0, 4)}-01`, month),
    getMarketMonthlyTotals(month, month),
  ]);
  const countIn = (target: string) =>
    crossTab
      .filter((row) => row.month === target)
      .reduce((total, row) => total + row.count, 0);
  const yearEntry = yearTotals.find((entry) => entry.make === make);

  return summariseMake({
    count: countIn(month),
    make,
    marketCount: marketMonthly[0]?.total ?? 0,
    month,
    previousCount: countIn(previousMonth),
    rank: yearEntry ? yearTotals.indexOf(yearEntry) + 1 : undefined,
    yearToDate: yearEntry?.count ?? 0,
  });
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

  const title = makeTitle(exactMake);
  const description = await loadMakeDescription(exactMake);
  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
      images: makesCardImages,
      title,
      description,
      url: `${SITE_URL}/cars/makes/${make}`,
    },
    twitter: {
      ...baseTwitter,
      title,
      description,
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

/** Stands in for the toolbar while the make name resolves. */
function MakeToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-80 max-w-full" />
      </div>
      <Skeleton className="h-10 w-96 max-w-full" />
    </div>
  );
}

export default function CarMakePage({ params, searchParams }: PageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <MakeStructuredData params={params} />
      </Suspense>

      {/* The dashboard template: toolbar, KPI tiles, a chart pair and one
          table. The make resolves from the URL and the figures follow the
          search params, so each region waits behind its own boundary. */}
      <OverviewPage className="gap-8 max-md:gap-6">
        <Suspense fallback={<MakeToolbarSkeleton />}>
          <MakeToolbar params={params} searchParams={searchParams} />
        </Suspense>

        <SectionErrorBoundary title="Make data unavailable">
          <Suspense
            fallback={
              <div className="flex flex-col gap-4">
                <Skeleton className="h-36 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
            }
          >
            <MakeReportSection params={params} searchParams={searchParams} />
          </Suspense>
        </SectionErrorBoundary>

        <Suspense fallback={null}>
          <MakeComparisons params={params} />
        </Suspense>
      </OverviewPage>
    </>
  );
}

async function MakeStructuredData({ params }: Pick<PageProps, "params">) {
  const { exactMake, make } = await resolveMake(params);

  const title = makeTitle(exactMake);
  const description = await loadMakeDescription(exactMake);

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

/** "LTA data to October 2026", and why there are no model figures. */
async function MakeAsOf() {
  const month = await getCarsLatestMonth();

  return (
    <>
      {month ? `LTA data to ${formatMonthLabel(month)}` : "LTA data"}, reported
      by make, fuel type and vehicle type, not by model
    </>
  );
}

/** The make's logo and name as the H1, with its switches and Share. */
async function MakeToolbar({ params, searchParams }: PageProps) {
  const [{ exactMake }, logoUrlBySlug] = await Promise.all([
    resolveMake(params),
    getCarLogoMap(),
  ]);

  return (
    <PageToolbar
      actions={
        <>
          <MakeControls make={exactMake} searchParams={searchParams} />
          <SharePill title={exactMake} />
        </>
      }
      asOf={<MakeAsOf />}
      title={
        <span className="flex items-center gap-4">
          {/* The logo repeats the name, so it stays out of the heading's
              accessible name. */}
          <span aria-hidden className="flex">
            <MakeAvatar
              logoUrl={logoUrlBySlug[slugify(exactMake)] ?? null}
              make={exactMake}
              size="lg"
            />
          </span>
          {exactMake}
        </span>
      }
    />
  );
}

async function MakeReportSection({ params, searchParams }: PageProps) {
  const { exactMake } = await resolveMake(params);

  return <MakeReport make={exactMake} searchParams={searchParams} />;
}

/**
 * "Compare BMW with" links to the curated comparison pages this make appears
 * in. Nothing for a make outside the list.
 */
async function MakeComparisons({ params }: Pick<PageProps, "params">) {
  const { exactMake, make } = await resolveMake(params);
  const pairs = pairsWithMake(make);

  if (pairs.length === 0) {
    return null;
  }

  return (
    <ComparisonLinks
      eyebrow="Compare"
      pairs={pairs}
      title={`Compare ${exactMake} with`}
    />
  );
}
