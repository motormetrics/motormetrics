import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  TwoShadeTrendChart,
  type TwoShadeTrendPoint,
} from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import {
  loadMakeRows,
  periodLabel,
  rollingMonths,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  isFuelFilter,
  loadSearchParams,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SourceNote } from "@web/components/shared/overview";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/** "+39.6%", with a true minus for a fall. */
const formatSignedPercent = (percent: number): string =>
  `${percent < 0 ? "−" : "+"}${Math.abs(percent).toFixed(1)}%`;

/**
 * The page headline: the leading make's count, its change on a year earlier,
 * its share, and its last twelve months as columns.
 */
export async function LeadingMakeCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, rows } = await loadMakeRows(range, fuel);
  const leader = rows[0];

  if (!leader || !latestMonth) {
    return null;
  }

  const fuelWord = isFuelFilter(fuel) ? fuel.toLowerCase() : null;
  const months = rollingMonths(latestMonth);
  const data: TwoShadeTrendPoint[] = leader.trend.map((count, index) => {
    const month = months[index];
    const isLatest = index === leader.trend.length - 1;
    return {
      count,
      earlier: isLatest ? 0 : count,
      label: formatChartMonth(month),
      latest: isLatest ? count : 0,
      title: formatMonthLabel(month),
      year: index === 0 || month.endsWith("-01") ? month.slice(0, 4) : "",
    };
  });

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <span className="flex items-center gap-2.5">
        <MakeAvatar logoUrl={leader.logoUrl} make={leader.make} size="sm" />
        <Typography.Paragraph color="muted" size="xs" weight="semibold">
          {isFuelFilter(fuel) ? `${fuel} · ` : null}
          {leader.make} leads the market
        </Typography.Paragraph>
      </span>
      <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={leader.count}
        />
      </span>
      <Typography.Paragraph className="tabular-nums" color="muted">
        <span className="font-semibold text-foreground">
          {leader.yoyChange === null
            ? "—"
            : formatSignedPercent(leader.yoyChange)}
        </span>{" "}
        against the same period a year earlier
      </Typography.Paragraph>
      <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
        {leader.share.toFixed(1)}% of{" "}
        {fuelWord ? `${fuelWord} registrations` : "registrations"} ·{" "}
        {RANGE_LABELS[range]}
      </Typography.Paragraph>
      <div className="mt-2.5">
        <TwoShadeTrendChart
          data={data}
          height={210}
          maxBarSize={30}
          ticks={axisTicks(leader.trend, { zero: true })}
          tooltipLabel="Registrations"
        />
      </div>
      <SourceNote>
        {leader.make}
        {fuelWord ? ` ${fuelWord}` : ""} registrations by month,{" "}
        {periodLabel(latestMonth, "12m")}.
      </SourceNote>
    </div>
  );
}
