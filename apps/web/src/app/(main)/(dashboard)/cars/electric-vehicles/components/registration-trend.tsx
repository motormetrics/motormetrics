import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { formatMonthLabel } from "@web/app/(main)/(dashboard)/cars/components/format-month";
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
import { DeltaChip } from "@web/components/shared/delta-chip";
import { Headline, SectionHead } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { getEvMonthlyTrend } from "@web/queries/cars";

const CHART_WIDTH = 700;
const CHART_HEIGHT = 200;

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

  const value = powertrainTotal(point, powertrain);
  const previous = trend[index - 1];
  const heading = HEADINGS[powertrain];
  const monthLabel = formatMonthLabel(point.month);

  return (
    <div className="flex flex-col gap-7">
      <SectionHead
        caption={`${RANGE_NOTES[range]} to ${monthLabel}`}
        eyebrow="Registrations"
        size="lg"
        title={heading.title}
        trailing={
          <QueryTabs
            ariaLabel="Chart range"
            options={RANGES.map((key) => ({ key, label: key }))}
            param="range"
            value={range}
          />
        }
      />

      <QueryTabs
        ariaLabel="Powertrain"
        options={POWERTRAIN_TABS}
        param="powertrain"
        value={powertrain}
      />

      <div className="flex flex-col gap-3.5">
        <Headline
          caption={`${heading.subject} registered in ${monthLabel}`}
          delta={
            <DeltaChip
              value={
                changeRatio(
                  value,
                  previous ? powertrainTotal(previous, powertrain) : 0,
                ) * 100
              }
            />
          }
          size="md"
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={value}
            />
          }
        />

        {series.length > 1 ? (
          <div className="flex flex-col gap-2">
            <SparklineChart
              height={CHART_HEIGHT}
              title={`${heading.title} over the ${series.length} months to ${monthLabel}`}
              values={series}
              width={CHART_WIDTH}
            />
            <div className="flex justify-between font-semibold text-[13px] text-muted">
              <span>
                {formatDateToMonthYear(visibleMonths.at(0)?.month ?? "")}
              </span>
              <span>{formatDateToMonthYear(point.month)}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
