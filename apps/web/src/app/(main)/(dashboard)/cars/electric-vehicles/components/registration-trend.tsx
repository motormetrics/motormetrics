import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  changeRatio,
  powertrainTotal,
  resolveMonthIndex,
  sliceRange,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { QueryTabs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/query-tabs";
import {
  POWERTRAIN_TABS,
  RANGE_NOTES,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import {
  type Powertrain,
  RANGES,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { SurfaceCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { sparkline } from "@web/components/shared/sparkline";
import { getEvMonthlyTrend } from "@web/queries/cars";
import { Zap } from "lucide-react";

const CHART_WIDTH = 560;
const CHART_HEIGHT = 190;

const HEADINGS: Record<Powertrain, { subject: string; title: string }> = {
  all: { subject: "electrified cars", title: "All electrified registrations" },
  bev: {
    subject: "battery-electric cars",
    title: "Battery-electric registrations",
  },
  hybrid: { subject: "hybrid cars", title: "Hybrid registrations" },
  phev: {
    subject: "plug-in hybrid cars",
    title: "Plug-in hybrid registrations",
  },
};

/**
 * Registrations over time for one powertrain.
 *
 * The comp tabs through individual makes here. The repo has no per-make monthly
 * EV series — `getEvMakeDetails()` only covers the latest month — so the tabs
 * segment by powertrain, which `getEvMonthlyTrend()` does carry.
 */
export async function RegistrationTrend({
  month,
  powertrain,
  range,
}: {
  month: string;
  powertrain: Powertrain;
  range: Range;
}) {
  const trend = await getEvMonthlyTrend();

  const index = resolveMonthIndex(
    trend.map((point) => point.month),
    month,
  );
  const point = trend[index];

  if (!point) {
    return null;
  }

  const visibleMonths = sliceRange(trend, index, range);
  const series = visibleMonths.map((entry) =>
    powertrainTotal(entry, powertrain),
  );
  const chart = sparkline(series, CHART_WIDTH, CHART_HEIGHT, 12);

  const value = powertrainTotal(point, powertrain);
  const previous = trend[index - 1];
  const heading = HEADINGS[powertrain];
  const monthLabel = formatDateToMonthYear(point.month);

  return (
    <SurfaceCard className="gap-5">
      <div className="flex flex-wrap items-center gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Zap className="size-5" />
        </span>
        <div className="flex min-w-0 flex-col">
          <Typography.Heading level={3}>{heading.title}</Typography.Heading>
          <Typography.Paragraph color="muted" size="sm">
            {RANGE_NOTES[range]} to {monthLabel}
          </Typography.Paragraph>
        </div>
        <div className="ml-auto">
          <QueryTabs
            ariaLabel="Chart range"
            options={RANGES.map((key) => ({ key, label: key }))}
            param="range"
            value={range}
            variant="segmented"
          />
        </div>
      </div>

      <QueryTabs
        ariaLabel="Powertrain"
        options={POWERTRAIN_TABS}
        param="powertrain"
        value={powertrain}
      />

      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-3.5">
          <span className="font-extrabold text-5xl tabular-nums tracking-tight lg:text-6xl">
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={value}
            />
          </span>
          <DeltaChip
            value={
              changeRatio(
                value,
                previous ? powertrainTotal(previous, powertrain) : 0,
              ) * 100
            }
          />
        </div>
        <Typography.Paragraph className="text-muted">
          {heading.subject} registered in {monthLabel}
        </Typography.Paragraph>
      </div>

      {chart ? (
        <div className="flex flex-col gap-1">
          <svg
            className="h-[190px] w-full overflow-visible"
            preserveAspectRatio="none"
            role="img"
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          >
            <title>{`${heading.title} over the ${series.length} months to ${monthLabel}`}</title>
            <path d={chart.area} fill="var(--accent)" opacity={0.12} />
            <path
              d={chart.line}
              fill="none"
              stroke="var(--accent)"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3.5}
            />
            <circle
              cx={chart.lastX}
              cy={chart.lastY}
              fill="var(--surface)"
              r={6.5}
              stroke="var(--accent)"
              strokeWidth={3.5}
            />
          </svg>
          <div className="flex justify-between">
            <Typography.Paragraph color="muted" size="xs">
              {formatDateToMonthYear(visibleMonths.at(0)?.month ?? "")}
            </Typography.Paragraph>
            <Typography.Paragraph color="muted" size="xs">
              {monthLabel}
            </Typography.Paragraph>
          </div>
        </div>
      ) : null}
    </SurfaceCard>
  );
}
