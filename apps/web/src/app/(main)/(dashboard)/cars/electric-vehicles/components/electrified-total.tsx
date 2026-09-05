import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatMonthName } from "@web/app/(main)/(dashboard)/cars/components/format-month";
import {
  buildRegistrationSplit,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  COMBUSTION_COLOUR,
  POWERTRAIN_SEGMENTS,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { Headline } from "@web/components/shared/overview";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";

/** Below this share a segment has no room for its own label inside the bar. */
const LABEL_THRESHOLD = 10;

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
    label: "Petrol & diesel",
  });

  return (
    <div className="flex flex-col gap-5">
      <Headline
        caption={`battery-electric and hybrid combined · ${formatMonthName(point.month)}`}
        delta={<DeltaChip unit="pp" value={electrifiedShare - previousShare} />}
        label="Electrified total"
        value={`${electrifiedShare.toFixed(1)}%`}
      />

      <div className="flex h-10 overflow-hidden rounded-full">
        {split.map((segment) => (
          <span
            className="inline-flex items-center justify-center font-extrabold text-[13px] tabular-nums"
            key={segment.label}
            style={{
              background: segment.colour,
              color:
                segment.colour === COMBUSTION_COLOUR
                  ? "var(--accent-strong)"
                  : "var(--accent-foreground)",
              flex: `${segment.share.toFixed(2)} 1 0`,
            }}
          >
            {segment.share >= LABEL_THRESHOLD
              ? `${segment.share.toFixed(0)}%`
              : ""}
          </span>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {split.map((segment) => (
          <li className="flex items-center gap-2.5" key={segment.label}>
            <span
              aria-hidden
              className="size-[11px] shrink-0 rounded-full"
              style={{ background: segment.colour }}
            />
            <Typography.Paragraph className="font-semibold text-foreground/85">
              {segment.label}
            </Typography.Paragraph>
            <span className="ml-auto font-extrabold text-base tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={segment.value}
              />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
