import { Skeleton } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  changeRatio,
  premiumAxisTicks,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { RangeTabs } from "@web/app/(main)/(dashboard)/coe/premiums/components/filters";
import {
  type PremiumPoint,
  PremiumTrendChart,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premium-trend-chart";
import {
  exerciseStamp,
  historyCaption,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-shared";
import {
  loadPremiumsView,
  type PremiumsPageProps,
  SelectedCategory,
} from "@web/app/(main)/(dashboard)/coe/premiums/components/premiums-view";
import {
  type PremiumRange,
  RANGE_EXERCISES,
} from "@web/app/(main)/(dashboard)/coe/premiums/search-params";
import { SectionErrorBoundary } from "@web/components/error-boundary";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { formatMonthShortName } from "@web/utils/dates/format-month";
import { Suspense } from "react";

/** Months between x ticks for each range, on desktop. */
const TICK_MONTHS: Record<PremiumRange, number> = {
  "1Y": 2,
  "3Y": 6,
  All: 24,
};

/** The selected window of the category's series, oldest first. */
async function loadTrend(searchParams: PremiumsPageProps["searchParams"]) {
  const view = await loadPremiumsView(searchParams);
  if (!view) {
    return null;
  }
  return {
    ...view,
    series: view.history.slice(-RANGE_EXERCISES[view.range]),
  };
}

/**
 * Figure 1: the category's premium by exercise over the chosen range. The
 * heading and source sit in the static shell; the caption, range switch and
 * chart follow the URL.
 */
export function PremiumsTrend({ searchParams }: PremiumsPageProps) {
  return (
    <section className="flex scroll-mt-4 flex-col gap-4" id="prem-hist">
      <SectionHead
        caption={
          <Suspense fallback=" ">
            <TrendCaption searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Figure 1 · Premium history"
        title={
          <>
            <SelectedCategory searchParams={searchParams} /> premium by exercise
          </>
        }
        trailing={
          <Suspense fallback={<Skeleton className="h-8 w-64 rounded-md" />}>
            <RangeTabs />
          </Suspense>
        }
      />
      <SectionErrorBoundary title="Premium history unavailable">
        <Suspense fallback={<Skeleton className="h-96 w-full rounded-md" />}>
          <TrendChart searchParams={searchParams} />
        </Suspense>
      </SectionErrorBoundary>
      <SourceNote>
        Source: LTA via DataMall · Quota premium at the close of each exercise
        <Suspense fallback=".">
          <TrendSource searchParams={searchParams} />
        </Suspense>{" "}
        Hover or tap for values.
      </SourceNote>
    </section>
  );
}

async function TrendCaption({ searchParams }: PremiumsPageProps) {
  const trend = await loadTrend(searchParams);
  return trend ? (historyCaption(trend.series, trend.category) ?? null) : null;
}

/** ", 24 exercises, Oct 2025 · 1st to Sep 2026 · 2nd. Y-axis …" */
async function TrendSource({ searchParams }: PremiumsPageProps) {
  const trend = await loadTrend(searchParams);
  const first = trend?.series[0];
  const last = trend?.series.at(-1);
  if (!trend || !first || !last) {
    return ".";
  }

  const ticks = premiumAxisTicks(trend.series.map(({ premium }) => premium));
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : undefined;
  const gridlines = step ? `gridlines every ${formatCurrency(step)}.` : "";
  const axisNote =
    (ticks[0] ?? 0) > 0
      ? `Y-axis does not start at zero${gridlines ? `; ${gridlines}` : "."}`
      : `Starts at $0${gridlines ? `; ${gridlines}` : "."}`;

  return `, ${trend.series.length} exercises, ${exerciseStamp(first)} to ${exerciseStamp(last)}. ${axisNote}`;
}

async function TrendChart({ searchParams }: PremiumsPageProps) {
  const trend = await loadTrend(searchParams);
  if (!trend) {
    return null;
  }

  const { range, series } = trend;
  const data: PremiumPoint[] = series.map((exercise, index) => {
    const [yearPart, monthPart] = exercise.month.split("-").map(Number);
    const earlier = series[index - 1];
    return {
      biddingNo: exercise.biddingNo,
      change: earlier
        ? changeRatio(exercise.premium, earlier.premium)
        : undefined,
      label: formatMonthShortName(exercise.month),
      monthIndex: yearPart * 12 + monthPart - 1,
      premium: exercise.premium,
      title: exerciseStamp(exercise),
    };
  });

  return (
    <PremiumTrendChart
      data={data}
      tickMonths={TICK_MONTHS[range]}
      ticks={premiumAxisTicks(series.map(({ premium }) => premium))}
    />
  );
}
