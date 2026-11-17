import { Skeleton } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import {
  buildMakeFigures,
  type MakeFigures,
  SERIES_LENGTH,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/figures";
import {
  fuelShareRows,
  vehicleShareRows,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/mix-rows";
import { ShareTable } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/share-table";
import {
  shareOf,
  trendSummary,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";
import { CompareTrendChart } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/trend-chart";
import { MakePickerSkeleton } from "@web/app/(main)/(dashboard)/cars/makes/compare/components/make-selectors";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { FigureCard } from "@web/components/shared/figure-card";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { PageToolbar } from "@web/components/shared/page-toolbar";
import { SharePill } from "@web/components/shared/share-pill";
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
import type { Route } from "next";
import { type ReactNode, Suspense } from "react";

/** Months of history the KPI sparklines draw. */
const SPARKLINE_MONTHS = 12;

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
export async function loadComparison(names: Promise<ComparisonNames>) {
  const { nameA, nameB } = await names;
  const [{ month }, rowsA, rowsB] = await Promise.all([
    getMonthOrLatest(null, "cars"),
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

/** Stands in for the toolbar while the makes resolve. */
export function CompareToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-80 max-w-full" />
        <Skeleton className="h-5 w-64 max-w-full" />
      </div>
      <MakePickerSkeleton />
    </div>
  );
}

/**
 * The H1 with both makes' logos, how current the data is, and the make
 * pickers beside Share.
 */
export async function ComparisonToolbar({
  controls,
  names,
}: ComparisonProps & { controls: ReactNode }) {
  const [{ nameA, nameB }, logoUrlBySlug, { month }] = await Promise.all([
    names,
    getCarLogoMap(),
    getMonthOrLatest(null, "cars"),
  ]);
  const title = `${nameA} vs ${nameB}`;

  return (
    <PageToolbar
      actions={
        <>
          {controls}
          <SharePill title={title} />
        </>
      }
      asOf={<>LTA data to {formatMonthLabel(month)} · figures year to date</>}
      title={
        <span className="flex flex-wrap items-center gap-4">
          {/* The logos repeat the names, so they stay out of the heading's
              accessible name. */}
          <span aria-hidden className="flex items-center gap-2">
            {[nameA, nameB].map((name) => (
              <MakeAvatar
                key={name}
                logoUrl={logoUrlBySlug[slugify(name)] ?? null}
                make={name}
                size="lg"
              />
            ))}
          </span>
          {title}
        </span>
      }
    />
  );
}

/** A make's registrations tile, linking to the make's own page. */
function registrationsTile(
  name: string,
  figures: MakeFigures,
  period: string,
): KpiTile {
  return {
    change:
      figures.change === null
        ? undefined
        : { label: "vs a year earlier", value: figures.change },
    format: "count",
    href: `/cars/makes/${slugify(name)}` as Route,
    note: period,
    title: `${name} registrations`,
    trend: figures.series.slice(-SPARKLINE_MONTHS),
    value: figures.ytd,
  };
}

/** Each make's registrations and its share of all new cars, year to date. */
async function CompareKpis({ names }: ComparisonProps) {
  const { a, b, month, nameA, nameB } = await loadComparison(names);
  const marketTotals = await getMarketMonthlyTotals(
    `${month.slice(0, 4)}-01`,
    month,
  );
  const marketTotal = marketTotals.reduce((sum, { total }) => sum + total, 0);
  const period = periodLabel(month, "ytd");

  const shareTile = (name: string, figures: MakeFigures): KpiTile => ({
    format: "percent",
    note: period,
    title: `${name} share of new cars`,
    value: shareOf(figures.ytd, marketTotal),
  });

  return (
    <KpiTiles
      tiles={[
        registrationsTile(nameA, a, period),
        registrationsTile(nameB, b, period),
        shareTile(nameA, a),
        shareTile(nameB, b),
      ]}
    />
  );
}

async function CompareTrendFigure({ names }: ComparisonProps) {
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
  );
}

async function CompareShareTable({ names }: ComparisonProps) {
  const { a, b, nameA, nameB } = await loadComparison(names);

  return (
    <ShareTable
      label={`${nameA} and ${nameB} registrations by fuel type and body type`}
      nameA={nameA}
      nameB={nameB}
      rows={[...fuelShareRows(a, b), ...vehicleShareRows(a, b)]}
    />
  );
}

/**
 * Everything under the toolbar: the KPI tiles, the monthly trend and the mix
 * table. Each waits on the makes behind its own boundary; the card titles are
 * in the shell. A fragment, so the sections sit in `OverviewPage`'s gap.
 */
export function ComparisonBody({ names }: ComparisonProps) {
  return (
    <>
      <SectionErrorBoundary title="Key numbers unavailable">
        <Suspense fallback={<Skeleton className="h-36 w-full" />}>
          <CompareKpis names={names} />
        </Suspense>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Monthly trend unavailable">
        <FigureCard
          description={`Last ${SERIES_LENGTH} months, all fuel types`}
          title="Monthly registrations"
        >
          <Suspense fallback={<Skeleton className="h-72 w-full" />}>
            <CompareTrendFigure names={names} />
          </Suspense>
        </FigureCard>
      </SectionErrorBoundary>

      <SectionErrorBoundary title="Fuel and body type mix unavailable">
        <FigureCard
          description="Share of each make’s registrations, year to date"
          title="Fuel and body type"
        >
          <Suspense fallback={<Skeleton className="h-80 w-full" />}>
            <CompareShareTable names={names} />
          </Suspense>
        </FigureCard>
      </SectionErrorBoundary>
    </>
  );
}
