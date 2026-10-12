import { Skeleton, Typography } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import { CoeComparisonChart } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/coe-comparison-chart";
import { buildMakeFaqs } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/faq-data";
import { MakeReport } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { MakeSearch } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-search";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import { RegistrationsChart } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/registrations-chart";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { MonthMenu } from "@web/components/shared/month-menu";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { SkeletonCard } from "@web/components/shared/skeleton";
import { Text } from "@web/components/shared/text";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import {
  createWebPageStructuredData,
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import { getDistinctMakes } from "@web/queries/cars";
import { getMakeCoeComparison } from "@web/queries/cars/makes/coe-comparison";
import { getMakeFromSlug } from "@web/queries/cars/makes/get-make-from-slug";
import { getCarLogoMap } from "@web/queries/logos";
import type { Make } from "@web/types";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
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

const makeTitle = (make: string) => `${make} Cars in Singapore`;

const makeDescription = (make: string) =>
  `${make} cars overview. Historical car registration trends and monthly breakdown by fuel and vehicle types in Singapore.`;

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
  const description = makeDescription(exactMake);
  return {
    title,
    description,
    openGraph: {
      ...baseOpenGraph,
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
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3 sm:ml-auto">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export default function CarMakePage({
  params,
  searchParams: searchParamsPromise,
}: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
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

      <Hairline />

      <SectionErrorBoundary title="COE comparison unavailable">
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <CarMakeCoeSection params={params} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-2.5">
          <Text.Paragraph eyebrow weight="semibold" color="muted" size="xs">
            Reading a make page
          </Text.Paragraph>
          <Typography.Paragraph size="sm">
            Registrations are counted by make as recorded at registration, so
            rebadged and parallel-imported cars appear under the same name as
            authorised-dealer stock.
          </Typography.Paragraph>
          <Typography.Paragraph size="sm">
            LTA reports registrations by make, fuel type and vehicle type — not
            by model, so there are no model-level figures anywhere on the site.
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
    </OverviewPage>
  );
}

/** The questions, templated with the make name, and their FAQPage schema. */
async function MakeFaq({ params }: Pick<PageProps, "params">) {
  const { exactMake } = await resolveMake(params);
  const faqs = buildMakeFaqs(exactMake);

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
  const description = makeDescription(exactMake);

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
  const [{ exactMake }, logoUrlBySlug] = await Promise.all([
    resolveMake(params),
    getCarLogoMap(),
  ]);

  return (
    <PageHead
      // `PageHead` has no slot before the title, so the comp's logo sits in
      // the badge slot after it.
      badge={
        <MakeAvatar
          logoUrl={logoUrlBySlug[slugify(exactMake)] ?? null}
          make={exactMake}
          size="lg"
        />
      }
      controls={
        // Nested on purpose: the month and make pickers fetch data of their
        // own, so the H1 lands as soon as the slug resolves instead of
        // waiting on them.
        <Suspense fallback={<SkeletonCard className="h-10 w-80" />}>
          <CarMakeHeaderMeta searchParams={searchParams} />
        </Suspense>
      }
      eyebrow="Cars · Makes"
      sub={
        <Suspense fallback={<Skeleton className="h-5 w-80" />}>
          <MakePeriodSub searchParams={searchParams} />
        </Suspense>
      }
      title={exactMake}
    />
  );
}

/**
 * "January to August 2026 · registrations by fuel type and vehicle type ·
 * Source: LTA via DataMall", under the title.
 */
async function MakePeriodSub({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth, range } =
    await loadSearchParams(searchParamsPromise);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  return (
    <>
      <span className="font-semibold text-foreground">
        {periodLabel(month, range)}
      </span>{" "}
      · registrations by fuel type and vehicle type · Source: LTA via DataMall
    </>
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
  const { month: parsedMonth } = await loadSearchParams(searchParamsPromise);
  const [months, makes, { wasAdjusted }] = await Promise.all([
    fetchMonthsForCars(),
    getDistinctMakes(),
    getMonthOrLatest(parsedMonth, "cars"),
  ]);

  return (
    <>
      {/* The comp hangs a make picker off the H1 itself. `PageHead` takes a
          plain string title, so it sits in the controls slot beside the month
          picker instead. */}
      <MakeSearch makes={makes.map(({ make }) => make)} />
      <MonthMenu
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
      <RegistrationsChart
        data={coeComparison.map(({ registrations }, index) => {
          const isLatest = index === coeComparison.length - 1;
          return {
            ...months[index],
            count: registrations,
            earlier: isLatest ? 0 : registrations,
            latest: isLatest ? registrations : 0,
          };
        })}
        ticks={axisTicks(
          coeComparison.map(({ registrations }) => registrations),
          { zero: true },
        )}
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
