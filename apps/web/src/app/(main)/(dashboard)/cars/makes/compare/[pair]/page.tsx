import { Chip, Skeleton, Typography } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import {
  ComparisonLinks,
  pairNames,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/comparison-links";
import { TableDisclosure } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/disclosure";
import { buildCompareFaqs } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/faq-data";
import {
  buildMakeFigures,
  SERIES_LENGTH,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/figures";
import {
  fuelShareRows,
  vehicleShareRows,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/mix-rows";
import { MonthlyTable } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/monthly-table";
import { PairMenu } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pair-menu";
import {
  COMPARE_PAIRS,
  findPair,
  otherPairs,
  pairSlug,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/pairs";
import { ShareTable } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/share-table";
import {
  buildSummaryRows,
  leadSentence,
  monthlyRows,
  trendSummary,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";
import { SummaryTable } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary-table";
import { CompareTrendChart } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/trend-chart";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import {
  Hairline,
  OverviewPage,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { SITE_URL } from "@web/config";
import {
  createWebPageStructuredData,
  generateBreadcrumbSchema,
  generateFAQPageSchema,
} from "@web/lib/metadata";
import { baseOpenGraph, baseTwitter } from "@web/lib/metadata/social";
import {
  getMakeCrossTab,
  getMarketMonthlyTotals,
} from "@web/queries/cars/makes/period-totals";
import { getCarLogoMap } from "@web/queries/logos";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { trailingMonths } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: Promise<{ pair: string }>;
}

// No `dynamicParams = false`: the segment config is incompatible with
// `cacheComponents`. Any slug outside the curated pairs 404s in
// `resolvePair` instead.
export function generateStaticParams() {
  return COMPARE_PAIRS.map((pair) => ({ pair: pairSlug(pair) }));
}

/** Kept short: the layout appends " - MotorMetrics" and titles stay ≤60. */
const compareTitle = (nameA: string, nameB: string) =>
  `${nameA} vs ${nameB} Cars in Singapore`;

/** The longer form for social cards, which have no length penalty. */
const compareSocialTitle = (nameA: string, nameB: string) =>
  `${nameA} vs ${nameB} in Singapore: Car Registrations Compared`;

const compareDescription = (nameA: string, nameB: string) =>
  `${nameA} vs ${nameB} new car registrations in Singapore: year-to-date totals, change on last year, market share, electric share, fuel and body type mix, and 24 months of monthly figures from LTA data.`;

const comparePath = (slug: string) => `/cars/makes/compare/${slug}`;

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { pair: slug } = await params;
  // 404 here, before any read: metadata blocks the response, so an uncurated
  // or reversed slug gets a real 404 status rather than a soft one from a
  // Suspense region after the shell has streamed.
  const pair = findPair(slug);
  if (!pair) {
    notFound();
  }

  const names = await pairNames(pair);
  if (!names) {
    notFound();
  }

  const [nameA, nameB] = names;
  const description = compareDescription(nameA, nameB);
  const socialTitle = compareSocialTitle(nameA, nameB);
  return {
    title: compareTitle(nameA, nameB),
    description,
    openGraph: {
      ...baseOpenGraph,
      title: socialTitle,
      description,
      url: `${SITE_URL}${comparePath(slug)}`,
    },
    twitter: {
      ...baseTwitter,
      title: socialTitle,
      description,
    },
    alternates: {
      canonical: comparePath(slug),
    },
  };
}

/**
 * Resolve the URL slug to a curated pair and both DB make names, 404ing on
 * anything else — the reversed order included. The curated check runs first,
 * so an unknown slug never reaches the database.
 *
 * Called per region rather than once at the top of the page, as the make page
 * does with `resolveMake`: awaiting `params` in the page component would take
 * the whole route out of the static shell. `getMakeFromSlug` is
 * `'use cache'`, so the repeats are reads, not lookups.
 */
async function resolvePair(params: PageProps["params"]) {
  const { pair: slug } = await params;
  const pair = findPair(slug);
  if (!pair) {
    notFound();
  }

  const names = await pairNames(pair);
  if (!names) {
    notFound();
  }

  const [nameA, nameB] = names;
  return { nameA, nameB, slug };
}

/**
 * Both makes' figures for the latest month with car data. Each region calls
 * it for itself; the reads are `'use cache'`, so only the first one queries.
 */
async function loadComparison(
  params: PageProps["params"],
  latest: Promise<{ month: string }> = getMonthOrLatest(null, "cars"),
) {
  const { nameA, nameB, slug } = await resolvePair(params);
  const [{ month }, rowsA, rowsB] = await Promise.all([
    latest,
    getMakeCrossTab(nameA),
    getMakeCrossTab(nameB),
  ]);

  return {
    a: buildMakeFigures(rowsA, month),
    b: buildMakeFigures(rowsB, month),
    month,
    nameA,
    nameB,
    slug,
  };
}

/** Stands in for `PageHead` while the pair resolves. */
function CompareHeadSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-96 max-w-full" />
        <Skeleton className="h-8 w-80 max-w-full" />
      </div>
      <div className="flex min-w-0 max-w-full flex-wrap items-center gap-3 sm:ml-auto">
        <Skeleton className="h-11 w-60" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

export default function CompareMakesPage({ params }: PageProps) {
  return (
    <OverviewPage className="gap-10 max-md:gap-7">
      <Suspense fallback={null}>
        <CompareStructuredData params={params} />
      </Suspense>

      <Suspense fallback={<CompareHeadSkeleton />}>
        <CompareHead params={params} />
      </Suspense>

      <SectionErrorBoundary title="Comparison unavailable">
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <CompareLead params={params} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <SectionErrorBoundary title="Monthly trend unavailable">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <CompareTrend params={params} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <SectionErrorBoundary title="Fuel and vehicle mix unavailable">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <CompareMix params={params} />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Monthly figures unavailable">
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <CompareMonthly params={params} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <Suspense fallback={null}>
        <CompareFaq params={params} />
      </Suspense>

      <Hairline />

      <Suspense fallback={<Skeleton className="h-16 w-full" />}>
        <OtherComparisons params={params} />
      </Suspense>
    </OverviewPage>
  );
}

/** WebPage and BreadcrumbList for the pair. */
async function CompareStructuredData({ params }: PageProps) {
  const { nameA, nameB, slug } = await resolvePair(params);
  const path = comparePath(slug);

  return (
    <>
      <StructuredData
        data={createWebPageStructuredData(
          compareTitle(nameA, nameB),
          compareDescription(nameA, nameB),
          path,
        )}
      />
      <StructuredData
        data={{
          "@context": "https://schema.org",
          ...generateBreadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Cars", path: "/cars" },
            { name: "Makes", path: "/cars/makes" },
            { name: `${nameA} vs ${nameB}`, path },
          ]),
        }}
      />
    </>
  );
}

/**
 * The H1, both makes' logos, the period chip and the pair menu. The period is
 * stated here once, so no caption or table below repeats it.
 */
async function CompareHead({ params }: PageProps) {
  const [{ nameA, nameB, slug }, logoUrlBySlug, { month }] = await Promise.all([
    resolvePair(params),
    getCarLogoMap(),
    getMonthOrLatest(null, "cars"),
  ]);

  return (
    <PageHead
      // `PageHead` has no slot before the title, so the logos sit in the
      // badge slot after it, as on the make page.
      badge={
        <span className="flex items-center gap-2">
          {[nameA, nameB].map((name) => (
            <MakeAvatar
              key={name}
              logoUrl={logoUrlBySlug[slugify(name)] ?? null}
              make={name}
              size="lg"
            />
          ))}
        </span>
      }
      controls={
        // Nested so the H1 lands as soon as the pair resolves, rather than
        // waiting on every other pair's make names.
        <Suspense fallback={<Skeleton className="h-11 w-60" />}>
          <ComparePairMenu current={slug} />
        </Suspense>
      }
      eyebrow="Cars · Makes · Compare"
      sub={
        <div className="flex flex-wrap items-center gap-3">
          <Chip size="lg" variant="soft">
            <Chip.Label>{periodLabel(month, "ytd")}</Chip.Label>
          </Chip>
          <span>
            New car registrations · Source: LTA via DataMall · updated monthly
          </span>
        </div>
      }
      title={`${nameA} vs ${nameB} in Singapore`}
    />
  );
}

/** The pair menu, labelled with each curated pair's make names. */
async function ComparePairMenu({ current }: { current: string }) {
  const pairs = await Promise.all(
    COMPARE_PAIRS.map(async (pair) => {
      const names = await pairNames(pair);
      return {
        label: names ? `${names[0]} vs ${names[1]}` : pairSlug(pair),
        slug: pairSlug(pair),
      };
    }),
  );

  return <PairMenu current={current} pairs={pairs} />;
}

/**
 * The answer first: one data-built sentence, then the four measures side by
 * side with the gap between them.
 */
async function CompareLead({ params }: PageProps) {
  // The market total needs only the month, so it runs alongside the two
  // makes' reads rather than after them.
  const latest = getMonthOrLatest(null, "cars");
  const [{ a, b, month, nameA, nameB }, marketTotals] = await Promise.all([
    loadComparison(params, latest),
    latest.then(({ month: latestMonth }) =>
      getMarketMonthlyTotals(`${latestMonth.slice(0, 4)}-01`, latestMonth),
    ),
  ]);
  const marketTotal = marketTotals.reduce((sum, { total }) => sum + total, 0);

  return (
    <section className="flex flex-col gap-6">
      <Typography.Paragraph
        className="max-w-prose text-pretty text-xl"
        weight="semibold"
      >
        {leadSentence({ a, b, month, nameA, nameB })}
      </Typography.Paragraph>
      <div className="flex flex-col gap-3">
        <SummaryTable
          nameA={nameA}
          nameB={nameB}
          rows={buildSummaryRows({ a, b, marketTotal, month })}
        />
        <SourceNote>Bold marks the higher figure in each row.</SourceNote>
      </div>
    </section>
  );
}

/** Both makes' last 24 months on one zero-based chart. */
async function CompareTrend({ params }: PageProps) {
  const { a, b, month, nameA, nameB } = await loadComparison(params);
  const months = trailingMonths(month, SERIES_LENGTH);

  const data = months.map((seriesMonth, index) => ({
    a: a.series[index] ?? 0,
    b: b.series[index] ?? 0,
    label: formatChartMonth(seriesMonth),
    title: formatMonthLabel(seriesMonth),
    year:
      index === 0 || seriesMonth.endsWith("-01") ? seriesMonth.slice(0, 4) : "",
  }));

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption="New registrations per month, all fuel types. The y-axis starts at zero."
        eyebrow="Trend"
        title="Monthly registrations, last 24 months"
      />
      <CompareTrendChart
        data={data}
        nameA={nameA}
        nameB={nameB}
        summary={trendSummary({
          months,
          nameA,
          nameB,
          seriesA: a.series,
          seriesB: b.series,
        })}
        ticks={axisTicks([...a.series, ...b.series], { zero: true })}
      />
    </section>
  );
}

/** Fuel type and vehicle type, each as shares of the make's own total. */
async function CompareMix({ params }: PageProps) {
  const { a, b, nameA, nameB } = await loadComparison(params);
  const vehicles = vehicleShareRows(a, b);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption="Share of each make’s registrations"
          eyebrow="Fuel type"
          title="How each make is powered"
        />
        <ShareTable
          ariaLabel={`${nameA} and ${nameB} registrations by fuel type`}
          firstColumn="Fuel type (LTA)"
          nameA={nameA}
          nameB={nameB}
          rows={fuelShareRows(a, b)}
        />
      </section>
      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption="Share of each make’s registrations"
          eyebrow="Vehicle type"
          title="What body styles sell"
        />
        <ShareTable
          ariaLabel={`${nameA} and ${nameB} registrations by vehicle type`}
          firstColumn="Vehicle type"
          nameA={nameA}
          nameB={nameB}
          rows={vehicles.rows}
        />
        {vehicles.otherBreakdown.length > 0 ? (
          <TableDisclosure title="Full breakdown of “Other”">
            <ShareTable
              ariaLabel="Full breakdown of other vehicle types"
              firstColumn="Vehicle type"
              nameA={nameA}
              nameB={nameB}
              rows={vehicles.otherBreakdown}
            />
          </TableDisclosure>
        ) : null}
      </section>
    </div>
  );
}

/** The chart's figures as a table, closed by default. */
async function CompareMonthly({ params }: PageProps) {
  const { a, b, month, nameA, nameB } = await loadComparison(params);

  return (
    <TableDisclosure title="Monthly figures, last 24 months">
      <MonthlyTable
        nameA={nameA}
        nameB={nameB}
        rows={monthlyRows({
          months: trailingMonths(month, SERIES_LENGTH),
          nameA,
          nameB,
          seriesA: a.series,
          seriesB: b.series,
        })}
      />
      <SourceNote>
        The same figures as the chart above, newest first.
      </SourceNote>
    </TableDisclosure>
  );
}

/** The questions, answered from the page's figures, and their FAQPage schema. */
async function CompareFaq({ params }: PageProps) {
  const { a, b, month, nameA, nameB } = await loadComparison(params);
  const faqs = buildCompareFaqs({ a, b, month, nameA, nameB });

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

/** Links to the other curated pairs and back to every make. */
async function OtherComparisons({ params }: PageProps) {
  const { slug } = await resolvePair(params);

  return (
    <ComparisonLinks
      eyebrow="Compare"
      link={{ href: "/cars/makes", label: "All makes" }}
      pairs={otherPairs(slug)}
      title="Other comparisons"
    />
  );
}
