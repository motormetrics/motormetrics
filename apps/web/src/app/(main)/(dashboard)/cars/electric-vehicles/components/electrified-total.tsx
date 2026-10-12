import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  buildRegistrationSplit,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  COMBUSTION_COLOUR,
  POWERTRAIN_SEGMENTS,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SourceNote } from "@web/components/shared/overview";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";
import { formatMonthName } from "@web/utils/dates/format-month";

/** Battery-electric, plug-in and conventional hybrids as one combined share. */
export async function ElectrifiedTotal({ month }: { month: string }) {
  const [trend, marketShare] = await Promise.all([
    getEvMonthlyTrend(),
    getEvMarketShare(),
  ]);

  const index = resolveMonthIndex(
    trend.map((point) => point.month),
    month,
  );
  const point = trend[index];

  if (!point) {
    return null;
  }

  const registrationsByMonth = new Map(
    marketShare.map((row) => [row.month, row.totalCount]),
  );
  const electrifiedShareAt = (position: number) => {
    const entry = trend[position];
    const total = entry ? registrationsByMonth.get(entry.month) : undefined;
    return entry && total
      ? ((entry.BEV + entry.PHEV + entry.Hybrid) / total) * 100
      : 0;
  };

  const total = registrationsByMonth.get(point.month) ?? 0;
  const electrifiedShare = electrifiedShareAt(index);
  const previousShare =
    index > 0 ? electrifiedShareAt(index - 1) : electrifiedShare;

  const split = buildRegistrationSplit(point, total, POWERTRAIN_SEGMENTS, {
    colour: COMBUSTION_COLOUR,
    label: "Petrol and diesel",
  });
  const monthName = formatMonthName(point.month);
  const previousMonth = trend[index - 1]?.month;

  return (
    <div className="flex flex-col gap-3">
      <Typography.Paragraph color="muted" size="xs" weight="semibold">
        Electrified total · {monthName}
      </Typography.Paragraph>
      <div className="flex flex-wrap items-baseline gap-3">
        <span className="font-bold text-3xl tabular-nums tracking-tight">
          {electrifiedShare.toFixed(1)}%
        </span>
        {previousMonth ? (
          <Typography.Paragraph className="tabular-nums" color="muted">
            <DeltaChip
              className="font-semibold text-foreground"
              unit="pp"
              value={electrifiedShare - previousShare}
            />{" "}
            vs {formatMonthName(previousMonth)}
          </Typography.Paragraph>
        ) : null}
      </div>

      <div
        aria-label="Share of new car registrations by powertrain"
        className="flex h-4 gap-0.5"
        role="img"
      >
        {split.map((segment) => (
          <span
            className="block h-full"
            key={segment.label}
            style={{
              background: segment.colour,
              width: `${segment.share.toFixed(2)}%`,
            }}
          />
        ))}
      </div>

      <ul className="flex flex-col">
        {split.map((segment) => (
          <li
            className="flex items-center gap-2.5 border-separator border-b py-2"
            key={segment.label}
          >
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-xs"
              style={{ background: segment.colour }}
            />
            <span className="min-w-0 flex-1 truncate text-sm">
              {segment.label}
            </span>
            <span className="w-16 text-right font-semibold text-sm tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={segment.value}
              />
            </span>
            <span className="w-14 text-right text-muted text-xs tabular-nums">
              {segment.share.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>

      <SourceNote>
        Electrified is battery-electric, plug-in hybrid and hybrid combined, as
        a share of {total.toLocaleString("en-SG")} new cars.
      </SourceNote>
    </div>
  );
}
