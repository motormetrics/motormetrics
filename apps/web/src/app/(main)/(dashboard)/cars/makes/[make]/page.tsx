import { Skeleton, Typography } from "@heroui/react";
import { formatOrdinal } from "@motormetrics/utils/format-ordinal";
import { slugify } from "@motormetrics/utils/slugify";
import { TwoShadeTrendChart } from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import { CoeComparisonChart } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/coe-comparison-chart";
import { buildMakeFaqs } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/faq-data";
import { FuelTypeSelect } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/filters";
import {
  loadMakeReport,
  MakeReport,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { MakeSearch } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-search";
import { percentage } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/percentage";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import { summariseMake } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/summary";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { ComparisonLinks } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import { pairsWithMake } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { PeriodSwitch } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-filters";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { KeyNumberList, KeysAside } from "@web/components/shared/key-numbers";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { MonthSelect } from "@web/components/shared/month-select";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { FilterGroup, FiltersPanel } from "@web/components/shared/page-filters";
import { PageHead } from "@web/components/shared/page-head";
import {
  PageBody,
  RelatedLinks,
  ScopeControl,
} from "@web/components/shared/page-layout";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import {
  createWebPageStructuredData,
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import {
  baseOpenGraph,
  baseTwitter,
  makesCardImages,
} from "@web/lib/metadata/social";
import { getDistinctMakes } from "@web/queries/cars";
import { getCarsLatestMonth } from "@web/queries/cars/latest-month";
import { getMakeCoeComparison } from "@web/queries/cars/makes/coe-comparison";
import { getMakeFromSlug } from "@web/queries/cars/makes/get-make-from-slug";
import {
  getMakeCrossTab,
  getMakeTotalsInRange,
  getMarketMonthlyTotals,
} from "@web/queries/cars/makes/period-totals";
import { getCarLogoMap } from "@web/queries/logos";
import type { Make } from "@web/types";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { fetchMonthsForCars, getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { SearchParams } from "nuqs/server";
import { type ReactNode, Suspense } from "react";

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

/** The latest month's summary sentence, shared by the snippet and the FAQ. */
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

/** Stands in for `PageHead` while the make name resolves. */
function MakeHeadSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-5 w-80" />
      </div>
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-4 sm:ml-auto">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/** The sections of the report, for the key numbers' "On this page" links. */
const JUMP_LINKS = [
  { href: "#make-trend", label: "By month" },
  { href: "#make-fuel-types", label: "By fuel type" },
  { href: "#make-vehicle-types", label: "By vehicle type" },
  { href: "#make-peers", label: "Against other makes" },
];

export default function CarMakePage({
  params,
  searchParams: searchParamsPromise,
}: PageProps) {
  // The month and the fuel type narrow the page, so they sit in the right
  // sidebar, with a "Filters" button in the head where the sidebar does not
  // fit. Built once and handed to both.
  const filters = (
    <>
      <FilterGroup label="Month">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <MakeMonthSelect searchParams={searchParamsPromise} />
        </Suspense>
      </FilterGroup>
      <FilterGroup label="Fuel type">
        <Suspense fallback={<Skeleton className="h-10 w-full" />}>
          <MakeFuelTypeSelect
            params={params}
            searchParams={searchParamsPromise}
          />
        </Suspense>
      </FilterGroup>
    </>
  );

  return (
    <OverviewPage className="gap-8 max-md:gap-6">
      <Suspense fallback={null}>
        <MakeStructuredData params={params} />
      </Suspense>

      <Suspense fallback={<MakeHeadSkeleton />}>
        <MakeHead
          filters={filters}
          params={params}
          searchParams={searchParamsPromise}
        />
      </Suspense>

      <PageBody
        rail={
          <>
            <FiltersPanel>{filters}</FiltersPanel>
            <SectionErrorBoundary title="Key numbers unavailable">
              <Suspense fallback={<Skeleton className="h-72 w-full" />}>
                <MakeRail params={params} searchParams={searchParamsPromise} />
              </Suspense>
            </SectionErrorBoundary>
          </>
        }
      >
        <SectionErrorBoundary title="Make data unavailable">
          <Suspense
            fallback={
              <div className="flex flex-col gap-4">
                <Skeleton className="h-96 w-full" />
                <Skeleton className="h-96 w-full" />
              </div>
            }
          >
            <MakeReportSection
              params={params}
              searchParams={searchParamsPromise}
            />
          </Suspense>
        </SectionErrorBoundary>
      </PageBody>

      {/* Sections the artboard does not draw sit below the two columns, so
          that on a narrow screen the key figures come before them. */}
      <PageBody>
        <Suspense fallback={null}>
          <MakeComparisons params={params} />
        </Suspense>

        <Hairline />

        <SectionErrorBoundary title="COE comparison unavailable">
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>
            <CarMakeCoeSection params={params} />
          </Suspense>
        </SectionErrorBoundary>

        <Hairline />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col gap-2">
            <Typography.Paragraph
              className="uppercase"
              weight="semibold"
              color="muted"
              size="xs"
            >
              Reading a make page
            </Typography.Paragraph>
            <Typography.Paragraph size="sm">
              Registrations are counted by make as recorded at registration, so
              rebadged and parallel-imported cars appear under the same name as
              authorised-dealer stock.
            </Typography.Paragraph>
            <Typography.Paragraph size="sm">
              LTA reports registrations by make, fuel type and vehicle type —
              not by model, so there are no model-level figures anywhere on the
              site.
            </Typography.Paragraph>
          </div>
          <div className="flex flex-wrap items-end gap-6 lg:justify-end">
            <SectionLink className="ml-0" href="/cars/makes">
              All makes
            </SectionLink>
            <SectionLink className="ml-0" href="/cars/fuel-types">
              Fuel types
            </SectionLink>
          </div>
        </div>

        <Hairline />

        <Suspense fallback={null}>
          <MakeFaq params={params} />
        </Suspense>
      </PageBody>

      <RelatedLinks
        links={[
          { href: "/cars/makes", label: "All makes" },
          { href: "/cars", label: "New registrations" },
          { href: "/cars/electric-vehicles", label: "Electric vehicles" },
        ]}
      />
    </OverviewPage>
  );
}

/** The questions, templated with the make name, and their FAQPage schema. */
async function MakeFaq({ params }: Pick<PageProps, "params">) {
  const { exactMake } = await resolveMake(params);
  const faqs = buildMakeFaqs(exactMake, await loadMakeSummary(exactMake));

  return (
    <>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateFAQPageSchema([{ items: faqs }]),
        }}
      />
      <PageFaq faqs={faqs} />
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

/**
 * The make-name H1. `PageHead` derives the share pill from its title, so the
 * whole head resolves together rather than splitting the string out.
 */
async function MakeHead({
  filters,
  params,
  searchParams,
}: PageProps & { filters: ReactNode }) {
  const [{ exactMake }, logoUrlBySlug] = await Promise.all([
    resolveMake(params),
    getCarLogoMap(),
  ]);

  return (
    <PageHead
      // `PageHead` has no slot before the title, so the logo sits in the
      // badge slot after it.
      badge={
        <MakeAvatar
          logoUrl={logoUrlBySlug[slugify(exactMake)] ?? null}
          make={exactMake}
          size="lg"
        />
      }
      controls={
        // The period sets what the whole page reports on, so it is the one
        // control in the head.
        <ScopeControl label="Period">
          <Suspense fallback={<Skeleton className="h-10 w-80 max-w-full" />}>
            <PeriodSwitch />
          </Suspense>
        </ScopeControl>
      }
      filters={filters}
      sub={
        <Suspense fallback={<Skeleton className="h-5 w-48" />}>
          <MakePeriodSub searchParams={searchParams} />
        </Suspense>
      }
      title={exactMake}
    />
  );
}

/** "January to August 2026", under the title. */
async function MakePeriodSub({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth, range } =
    await loadSearchParams(searchParamsPromise);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return periodLabel(month, range);
}

async function MakeReportSection({ params, searchParams }: PageProps) {
  const { exactMake } = await resolveMake(params);

  return <MakeReport make={exactMake} searchParams={searchParams} />;
}

/** The month the period ends on, in the filters. */
async function MakeMonthSelect({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParamsPromise);
  const [months, { wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  return (
    <MonthSelect
      fullWidth
      latestMonth={months[0]}
      months={months}
      wasAdjusted={wasAdjusted}
    />
  );
}

/** The fuel types this make registers in the period, in the filters. */
async function MakeFuelTypeSelect({ params, searchParams }: PageProps) {
  const { exactMake } = await resolveMake(params);
  const { fuelTypeOptions } = await loadMakeReport(exactMake, searchParams);

  return <FuelTypeSelect fuelTypes={fuelTypeOptions} />;
}

/**
 * The right sidebar under the filters: the make's key numbers for the
 * selected period, the way back to every make, and the picker that jumps to
 * another make's page.
 */
async function MakeRail({ params, searchParams }: PageProps) {
  const [{ exactMake }, makes] = await Promise.all([
    resolveMake(params),
    getDistinctMakes(),
  ]);

  return (
    <>
      <KeysAside
        eyebrow={`Key numbers · ${exactMake}`}
        jump={JUMP_LINKS}
        label="Key numbers"
        source="Source: LTA via DataMall."
      >
        <Suspense fallback={<Skeleton className="h-40 w-full" />}>
          <MakeKeyNumbers make={exactMake} searchParams={searchParams} />
        </Suspense>
      </KeysAside>
      <div className="flex flex-col gap-2">
        <Typography.Paragraph color="muted" size="xs" weight="semibold">
          Go to another make
        </Typography.Paragraph>
        <MakeSearch makes={makes.map(({ make }) => make)} />
        <SectionLink className="ml-0 self-start" href="/cars/makes">
          All makes
        </SectionLink>
      </div>
    </>
  );
}

/**
 * The make's figures for the selected period, month and fuel type: the ones
 * the page used to open on, now beside the report.
 */
async function MakeKeyNumbers({
  make,
  searchParams,
}: {
  make: string;
  searchParams: Promise<SearchParams>;
}) {
  const {
    fuelType,
    makesCount,
    marketTotal,
    month,
    monthCount,
    periodCaption,
    previousMonthCount,
    previousTotal,
    rank,
    total,
  } = await loadMakeReport(make, searchParams);
  const formatCount = (value: number) => value.toLocaleString("en-SG");
  const changeOn = (current: number, previous: number) =>
    previous > 0
      ? `${current < previous ? "−" : "+"}${Math.abs(percentageChange(current, previous)).toFixed(1)}%`
      : null;
  const yearChange = changeOn(total, previousTotal);
  const monthChange = changeOn(monthCount, previousMonthCount);

  return (
    <KeyNumberList
      besideHead={4}
      items={[
        {
          label: fuelType ? `New ${fuelType} cars` : "New cars",
          note: `${periodCaption}${yearChange ? ` · ${yearChange} on a year earlier` : ""}`,
          value: formatCount(total),
        },
        {
          label: "Rank",
          note: fuelType
            ? `of ${makesCount} makes, all fuel types`
            : `of ${makesCount} makes`,
          value: rank > 0 ? formatOrdinal(rank) : "–",
        },
        {
          label: "Share of new cars",
          note: `of ${formatCount(marketTotal)} new cars`,
          value: percentage(total, marketTotal),
        },
        {
          label: formatMonthLabel(month),
          note: monthChange
            ? `${monthChange} on ${formatMonthName(shiftMonth(month, -1))}`
            : "none the month before",
          value: formatCount(monthCount),
        },
      ]}
    />
  );
}

/**
 * "Compare BMW with" links to the curated comparison pages this make appears
 * in, with its own hairline above. Nothing for a make outside the list.
 */
async function MakeComparisons({ params }: Pick<PageProps, "params">) {
  const { exactMake, make } = await resolveMake(params);
  const pairs = pairsWithMake(make);

  if (pairs.length === 0) {
    return null;
  }

  return (
    <>
      <Hairline />
      <ComparisonLinks
        eyebrow="Compare"
        pairs={pairs}
        title={`Compare ${exactMake} with`}
      />
    </>
  );
}

async function CarMakeCoeSection({ params }: Pick<PageProps, "params">) {
  const { exactMake } = await resolveMake(params);
  const coeComparison = await getMakeCoeComparison(exactMake);

  const first = coeComparison[0];
  const last = coeComparison.at(-1);
  if (!first || !last) {
    return null;
  }

  // Each month carries its label, and its year under the first month and
  // every January, for both charts' axes.
  const months = coeComparison.map(({ month }, index) => ({
    label: formatChartMonth(month),
    title: formatMonthLabel(month),
    year: index === 0 || month.endsWith("-01") ? month.slice(0, 4) : "",
  }));
  const premiums = coeComparison.flatMap(
    ({ categoryAPremium, categoryBPremium }) => [
      categoryAPremium,
      categoryBPremium,
    ],
  );

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${formatMonthLabel(first.month)} to ${formatMonthLabel(last.month)} · ${exactMake} registrations, then Category A and B premiums on the same months`}
        eyebrow="Context"
        title="Registrations against COE premiums"
      />
      <TwoShadeTrendChart
        data={coeComparison.map(({ registrations }, index) => {
          const isLatest = index === coeComparison.length - 1;
          return {
            ...months[index],
            count: registrations,
            earlier: isLatest ? 0 : registrations,
            latest: isLatest ? registrations : 0,
          };
        })}
        height={220}
        maxBarSize={40}
        thinTicks
        ticks={axisTicks(
          coeComparison.map(({ registrations }) => registrations),
          { zero: true },
        )}
        tooltipLabel="Registrations"
      />
      <SourceNote>
        {exactMake} registrations by month, all fuel types.
      </SourceNote>
      <CoeComparisonChart
        data={coeComparison.map(
          ({ categoryAPremium, categoryBPremium }, index) => ({
            ...months[index],
            categoryA: categoryAPremium,
            categoryB: categoryBPremium,
          }),
        )}
        ticks={axisTicks(premiums, { zero: false })}
      />
      <SourceNote>
        COE premium in S$ by month. The axis does not start at zero.
      </SourceNote>
    </section>
  );
}
