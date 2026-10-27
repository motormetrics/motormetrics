import { Chip, Skeleton, Typography } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
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
import { ShareTable } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/share-table";
import {
  buildSummaryRows,
  leadSentence,
  monthlyRows,
  trendSummary,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";
import { SummaryTable } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary-table";
import { CompareTrendChart } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/trend-chart";
import { MakePickerSkeleton } from "@web/app/(main)/(dashboard)/cars/makes/compare/components/make-selectors";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import {
  Hairline,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { PageFaq } from "@web/components/shared/page-faq";
import { PageHead } from "@web/components/shared/page-head";
import { StructuredData } from "@web/components/structured-data";
import { generateFAQPageSchema } from "@web/lib/metadata";
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
import { type ReactNode, Suspense } from "react";

/** Both makes' DB names, in column order. */
export interface ComparisonNames {
  nameA: string;
  nameB: string;
}

/**
 * The names arrive as a promise so the page can hand it down unawaited and
 * each region awaits it for itself, keeping the route's static shell.
 */
interface ComparisonProps {
  names: Promise<ComparisonNames>;
}

/**
 * Both makes' figures for the latest month with car data. Each region calls
 * it for itself; the reads are `'use cache'`, so only the first one queries.
 */
export async function loadComparison(
  names: Promise<ComparisonNames>,
  latest: Promise<{ month: string }> = getMonthOrLatest(null, "cars"),
) {
  const { nameA, nameB } = await names;
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
  };
}

/** Stands in for `PageHead` while the makes resolve. */
export function CompareHeadSkeleton() {
  return (
    <div className="flex flex-wrap items-end gap-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-12 w-96 max-w-full" />
        <Skeleton className="h-8 w-80 max-w-full" />
      </div>
      <div className="min-w-0 max-w-full sm:ml-auto">
        <MakePickerSkeleton />
      </div>
    </div>
  );
}

/**
 * The H1, both makes' logos, the period chip and the controls. The period is
 * stated here once, so no caption or table below repeats it.
 */
export async function ComparisonHead({
  controls,
  names,
}: ComparisonProps & { controls: ReactNode }) {
  const [{ nameA, nameB }, logoUrlBySlug, { month }] = await Promise.all([
    names,
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
      controls={controls}
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

/**
 * Everything below the head: lead and summary, trend, fuel and vehicle mix,
 * monthly figures and FAQ, each in its own boundary. A fragment, so the
 * sections sit directly in `OverviewPage`'s gap layout.
 */
export function ComparisonBody({
  faqSchema,
  names,
}: ComparisonProps & {
  /** Emit FAQPage schema; off on pages that are not indexed. */
  faqSchema: boolean;
}) {
  return (
    <>
      <SectionErrorBoundary title="Comparison unavailable">
        <Suspense
          fallback={
            <div className="flex flex-col gap-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          }
        >
          <CompareLead names={names} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <SectionErrorBoundary title="Monthly trend unavailable">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <CompareTrend names={names} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <SectionErrorBoundary title="Fuel and vehicle mix unavailable">
        <Suspense fallback={<Skeleton className="h-80 w-full" />}>
          <CompareMix names={names} />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Monthly figures unavailable">
        <Suspense fallback={<Skeleton className="h-12 w-full" />}>
          <CompareMonthly names={names} />
        </Suspense>
      </SectionErrorBoundary>

      <Hairline />

      <Suspense fallback={null}>
        <CompareFaq faqSchema={faqSchema} names={names} />
      </Suspense>
    </>
  );
}

/**
 * The answer first: one data-built sentence, then the four measures side by
 * side with the gap between them.
 */
async function CompareLead({ names }: ComparisonProps) {
  // The market total needs only the month, so it runs alongside the two
  // makes' reads rather than after them.
  const latest = getMonthOrLatest(null, "cars");
  const [{ a, b, month, nameA, nameB }, marketTotals, logoUrlBySlug] =
    await Promise.all([
      loadComparison(names, latest),
      latest.then(({ month: latestMonth }) =>
        getMarketMonthlyTotals(`${latestMonth.slice(0, 4)}-01`, latestMonth),
      ),
      getCarLogoMap(),
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
          logoUrlA={logoUrlBySlug[slugify(nameA)] ?? null}
          logoUrlB={logoUrlBySlug[slugify(nameB)] ?? null}
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
async function CompareTrend({ names }: ComparisonProps) {
  const { a, b, month, nameA, nameB } = await loadComparison(names);
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
async function CompareMix({ names }: ComparisonProps) {
  const { a, b, nameA, nameB } = await loadComparison(names);
  const vehicles = vehicleShareRows(a, b);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-14">
      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption="Share of each make’s registrations"
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
async function CompareMonthly({ names }: ComparisonProps) {
  const { a, b, month, nameA, nameB } = await loadComparison(names);

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

/**
 * The questions, answered from the page's figures, and — when `faqSchema` is
 * set — their FAQPage schema.
 */
async function CompareFaq({
  faqSchema,
  names,
}: ComparisonProps & { faqSchema: boolean }) {
  const { a, b, month, nameA, nameB } = await loadComparison(names);
  const faqs = buildCompareFaqs({ a, b, month, nameA, nameB });

  return (
    <>
      {faqSchema ? (
        <StructuredData
          data={{
            "@context": "https://schema.org",
            ...generateFAQPageSchema([{ items: faqs }]),
          }}
        />
      ) : null}
      <PageFaq faqs={faqs} />
    </>
  );
}
