import { Skeleton } from "@heroui/react";
import type { SelectionProps } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import {
  changeRatio,
  powertrainTotal,
  resolveMonthIndex,
  sliceRange,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { QueryTabs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/query-tabs";
import {
  RegistrationTrendChart,
  type RegistrationTrendPoint,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/registration-trend-chart";
import {
  POWERTRAIN_TABS,
  RANGE_NOTES,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { RANGES } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { FigureCard } from "@web/components/shared/figure-card";
import { getEvMonthlyTrend } from "@web/queries/cars";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { Suspense } from "react";

/** "+2.0% vs previous month", with a true minus for a fall. */
const formatChange = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}% vs previous month`;

/** The selected powertrain's months in range, ending at the selected month. */
async function loadTrend({ selection }: SelectionProps) {
  const [{ month, powertrain, range }, trend] = await Promise.all([
    selection,
    getEvMonthlyTrend(),
  ]);
  const index = resolveMonthIndex(
    trend.map((point) => point.month),
    month,
  );
  const point = trend[index];
  if (!point) {
    return null;
  }

  const visibleMonths = sliceRange(trend, index, range);
  const points = visibleMonths.map((entry) => ({
    month: entry.month,
    value: powertrainTotal(entry, powertrain),
  }));
  const firstMonth = points.at(0)?.month ?? point.month;

  return {
    period:
      range === "All"
        ? `From ${formatMonthLabel(firstMonth)}`
        : RANGE_NOTES[range],
    point,
    points,
    range,
  };
}

async function TrendPeriod({ selection }: SelectionProps) {
  const data = await loadTrend({ selection });

  return data
    ? `${data.period} to ${formatMonthLabel(data.point.month)}`
    : null;
}

async function TrendControls({ selection }: SelectionProps) {
  const { powertrain, range } = await selection;

  return (
    <>
      <QueryTabs
        ariaLabel="Powertrain"
        options={POWERTRAIN_TABS}
        param="powertrain"
        value={powertrain}
      />
      <QueryTabs
        ariaLabel="Chart range"
        options={RANGES.map((key) => ({ key, label: key }))}
        param="range"
        value={range}
      />
    </>
  );
}

async function TrendChart({ selection }: SelectionProps) {
  const data = await loadTrend({ selection });
  if (!data) {
    return null;
  }

  const { points, range } = data;
  const chartData: RegistrationTrendPoint[] = points.map((entry, offset) => {
    const before = points[offset - 1];
    return {
      change: before
        ? formatChange(changeRatio(entry.value, before.value))
        : "First in range",
      month: entry.month,
      title: formatMonthLabel(entry.month),
      value: entry.value,
    };
  });

  return chartData.length > 1 ? (
    <RegistrationTrendChart
      data={chartData}
      range={range}
      ticks={axisTicks(
        chartData.map((entry) => entry.value),
        { zero: true },
      )}
    />
  ) : null;
}

/**
 * Registrations by month for one powertrain, with powertrain and range
 * switches. The card is in the static shell; the parts that follow the
 * search params wait behind their own boundaries.
 */
export function RegistrationTrendCard({ selection }: SelectionProps) {
  return (
    <FigureCard
      description={
        <Suspense fallback=" ">
          <TrendPeriod selection={selection} />
        </Suspense>
      }
      title="EV registrations by month"
      trailing={
        <Suspense fallback={<Skeleton className="h-8 w-72 max-w-full" />}>
          <TrendControls selection={selection} />
        </Suspense>
      }
    >
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <TrendChart selection={selection} />
      </Suspense>
    </FigureCard>
  );
}
