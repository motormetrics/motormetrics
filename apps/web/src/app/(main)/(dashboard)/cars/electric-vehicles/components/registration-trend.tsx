import { Skeleton, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import type { SelectionProps } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import {
  changeRatio,
  powertrainTotal,
  resolveMonthIndex,
  sliceRange,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { trendCaption } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-summary";
import { QueryTabs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/query-tabs";
import {
  RegistrationTrendChart,
  type RegistrationTrendPoint,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/registration-trend-chart";
import {
  POWERTRAIN_TABS,
  RANGE_NOTES,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import {
  type Powertrain,
  RANGES,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getEvMonthlyTrend } from "@web/queries/cars";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { Suspense } from "react";

const HEADINGS: Record<Powertrain, { caption: string; subject: string }> = {
  all: {
    caption: "Electrified",
    subject: "electrified cars",
  },
  bev: {
    caption: "Battery-electric",
    subject: "battery-electric cars",
  },
  hybrid: { caption: "Hybrid", subject: "hybrids" },
  phev: {
    caption: "Plug-in hybrid",
    subject: "plug-in hybrids",
  },
};

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
    heading: HEADINGS[powertrain],
    period:
      range === "All"
        ? `From ${formatMonthLabel(firstMonth)}`
        : RANGE_NOTES[range],
    point,
    points,
    powertrain,
    previous: trend[index - 1],
    range,
  };
}

async function TrendPeriod({ selection }: SelectionProps) {
  const data = await loadTrend({ selection });

  return data
    ? `${data.period} to ${formatMonthLabel(data.point.month)}`
    : null;
}

async function TrendCaption({ selection }: SelectionProps) {
  const data = await loadTrend({ selection });

  return data ? trendCaption(data.points, data.heading.caption) : null;
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

async function TrendBody({ selection }: SelectionProps) {
  const data = await loadTrend({ selection });
  if (!data) {
    return null;
  }

  const { heading, point, points, powertrain, previous, range } = data;
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
  const value = powertrainTotal(point, powertrain);

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-semibold text-2xl tabular-nums tracking-tight">
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={value} />
        </span>
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {previous ? (
            <>
              <DeltaChip
                className="font-semibold text-foreground"
                value={
                  changeRatio(value, powertrainTotal(previous, powertrain)) *
                  100
                }
              />{" "}
              vs {formatMonthName(previous.month)} ·{" "}
            </>
          ) : null}
          {heading.subject} registered in {formatMonthLabel(point.month)}
        </Typography.Paragraph>
      </div>
      {chartData.length > 1 ? (
        <RegistrationTrendChart
          data={chartData}
          range={range}
          ticks={axisTicks(
            chartData.map((entry) => entry.value),
            { zero: true },
          )}
        />
      ) : null}
    </>
  );
}

/**
 * Figure 2: registrations over time for one powertrain, with powertrain and
 * range switches. The eyebrow and source are in the static shell; everything
 * that follows the search params waits behind its own boundary.
 *
 * The repo has no per-make monthly EV series, so the tabs segment by
 * powertrain, which `getEvMonthlyTrend()` does carry.
 */
export function RegistrationTrend({ selection }: SelectionProps) {
  return (
    <section className="flex scroll-mt-4 flex-col gap-4" id="ev-trend">
      <SectionHead
        caption={
          <Suspense fallback=" ">
            <TrendCaption selection={selection} />
          </Suspense>
        }
        eyebrow={
          <>
            Figure 2 · Registrations ·{" "}
            <Suspense fallback=" ">
              <TrendPeriod selection={selection} />
            </Suspense>
          </>
        }
        title="Electrified registrations by month"
        trailing={
          <Suspense fallback={<Skeleton className="h-8 w-96 max-w-full" />}>
            <TrendControls selection={selection} />
          </Suspense>
        }
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <TrendBody selection={selection} />
      </Suspense>
      <SourceNote>
        Source: LTA via DataMall · New car registrations each month. Y-axis
        starts at zero. Hover or tap for values.
      </SourceNote>
    </section>
  );
}
