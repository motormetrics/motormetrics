import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatOrdinal } from "@motormetrics/utils/format-ordinal";
import { summariseType } from "@web/app/(main)/(dashboard)/cars/components/category/type-summary";
import {
  type Period,
  periodRange,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { share } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/vehicle-type-shared";
import { DeltaChip } from "@web/components/shared/delta-chip";
import type {
  TypeCount,
  TypeMonthlyPoint,
} from "@web/queries/cars/type-detail";
import { percentageChange } from "@web/utils/change-ratio";
import { formatMonthShortLabel } from "@web/utils/dates/format-month";

/**
 * The headline figure, its change on a year earlier and the two-by-two grid
 * of share, electric share, makes and best month.
 */
export function VehicleTypeHeadline({
  crossMix,
  displayName,
  distribution,
  makeCount,
  marketTotal,
  month,
  period,
  periodLabel,
  previousDistribution,
  series,
  typeTotal,
  value,
}: {
  crossMix: TypeCount[];
  displayName: string;
  distribution: TypeCount[];
  makeCount: number;
  marketTotal: number;
  month: string;
  period: Period;
  periodLabel: string;
  previousDistribution: TypeCount[];
  series: TypeMonthlyPoint[];
  typeTotal: number;
  value: string;
}) {
  const previousTypeTotal =
    previousDistribution.find((row) => row.name === value)?.count ?? 0;
  const rank = distribution.findIndex((row) => row.name === value) + 1;
  const previousMarketTotal = previousDistribution.reduce(
    (sum, row) => sum + row.count,
    0,
  );
  const summary = summariseType({
    count: typeTotal,
    label: displayName,
    periodLabel: periodRange(period, month),
    previousShare:
      previousMarketTotal > 0
        ? share(previousTypeTotal, previousMarketTotal)
        : undefined,
    share: share(typeTotal, marketTotal),
  });

  // The busiest month in the charted year, the latest of any tie.
  const bestMonth = series.reduce<(typeof series)[number] | undefined>(
    (best, point) => (!best || point.count >= best.count ? point : best),
    undefined,
  );
  const electricCount =
    crossMix.find((row) => row.name === "Electric")?.count ?? 0;
  const marketShare = `${share(typeTotal, marketTotal).toFixed(1)}%`;

  // The comp's two-by-two grid beside the headline figure.
  const stats = [
    {
      label: "Share of registrations",
      note: periodLabel.toLowerCase(),
      value: marketShare,
    },
    {
      label: "Electric share",
      note: `of ${displayName} registrations`,
      value: `${share(electricCount, typeTotal).toFixed(1)}%`,
    },
    {
      label: "Makes",
      note: "with registrations",
      value: makeCount.toLocaleString("en-SG"),
    },
    {
      label: "Best month",
      note: bestMonth
        ? `${formatMonthShortLabel(bestMonth.month)} · last ${series.length} months`
        : `last ${series.length} months`,
      value: (bestMonth?.count ?? 0).toLocaleString("en-SG"),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="flex min-w-0 flex-col gap-3">
          <span className="font-semibold text-muted text-xs">
            {displayName} registrations
          </span>
          <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={typeTotal}
            />
          </span>
          <Typography.Paragraph className="tabular-nums" color="muted">
            <DeltaChip
              className="font-semibold text-foreground"
              value={percentageChange(typeTotal, previousTypeTotal)}
            />{" "}
            against the same period a year earlier
          </Typography.Paragraph>
          <Typography.Paragraph
            className="tabular-nums"
            color="muted"
            size="sm"
          >
            {periodLabel} · {marketShare} of all registrations
            {rank > 0
              ? ` · ${formatOrdinal(rank)} largest of ${distribution.length} vehicle types`
              : ""}
          </Typography.Paragraph>
        </div>
        <div className="grid grid-cols-2 border-border border-t">
          {stats.map((stat) => (
            <div
              className="flex min-w-0 flex-col gap-1 border-separator border-b py-3.5 pr-4 even:border-l even:pl-4"
              key={stat.label}
            >
              <span className="truncate font-semibold text-muted text-xs">
                {stat.label}
              </span>
              <span className="font-semibold text-xl tabular-nums tracking-tight md:text-2xl">
                {stat.value}
              </span>
              <span className="truncate text-muted text-xs">{stat.note}</span>
            </div>
          ))}
        </div>
      </div>
      <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
        {summary}
      </Typography.Paragraph>
    </div>
  );
}
