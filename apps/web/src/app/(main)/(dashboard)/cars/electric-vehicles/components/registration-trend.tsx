import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
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
import {
  type Powertrain,
  RANGES,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getEvMonthlyTrend } from "@web/queries/cars";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";

const HEADINGS: Record<Powertrain, { subject: string; title: string }> = {
  all: { subject: "electrified cars", title: "All electrified registrations" },
  bev: {
    subject: "battery-electric cars",
    title: "Battery-electric registrations",
  },
  hybrid: { subject: "hybrids", title: "Hybrid registrations" },
  phev: {
    subject: "plug-in hybrids",
    title: "Plug-in hybrid registrations",
  },
};

/** "+2.0% vs previous month", with a true minus for a fall. */
const formatChange = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}% vs previous month`;

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
  const data: RegistrationTrendPoint[] = visibleMonths.map((entry, offset) => {
    const value = powertrainTotal(entry, powertrain);
    const previous = visibleMonths[offset - 1];
    return {
      change: previous
        ? formatChange(
            changeRatio(value, powertrainTotal(previous, powertrain)),
          )
        : "First in range",
      month: entry.month,
      title: formatMonthLabel(entry.month),
      value,
    };
  });
  const ticks = axisTicks(
    data.map((entry) => entry.value),
    { zero: true },
  );
  const gridStep = (ticks[1] ?? 0) - (ticks[0] ?? 0);

  const value = powertrainTotal(point, powertrain);
  const previous = trend[index - 1];
  const heading = HEADINGS[powertrain];
  const monthLabel = formatMonthLabel(point.month);
  const firstMonth = visibleMonths.at(0)?.month ?? point.month;
  const period =
    range === "All"
      ? `From ${formatMonthLabel(firstMonth)}`
      : RANGE_NOTES[range];

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${period} to ${monthLabel}`}
        eyebrow="Registrations"
        title={heading.title}
      />

      <div className="flex flex-wrap items-center gap-3">
        <QueryTabs
          ariaLabel="Powertrain"
          options={POWERTRAIN_TABS}
          param="powertrain"
          value={powertrain}
        />
        <div className="max-md:w-full md:ml-auto">
          <QueryTabs
            ariaLabel="Chart range"
            options={RANGES.map((key) => ({ key, label: key }))}
            param="range"
            value={range}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-bold text-3xl tabular-nums tracking-tight">
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
          {heading.subject} registered in {monthLabel}
        </Typography.Paragraph>
      </div>

      {data.length > 1 ? (
        <RegistrationTrendChart data={data} range={range} ticks={ticks} />
      ) : null}

      <SourceNote>
        Source: LTA via DataMall · New car registrations each month · Y-axis
        starts at zero
        {gridStep > 0
          ? `; gridlines every ${gridStep.toLocaleString("en-SG")} cars`
          : ""}
        .
      </SourceNote>
    </section>
  );
}
