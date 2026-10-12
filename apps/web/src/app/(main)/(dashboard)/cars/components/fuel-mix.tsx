import { Typography } from "@heroui/react";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { getCarsData } from "@web/queries/cars";
import type { DonutSegment } from "@web/utils/charts/donut-arcs";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/**
 * Fuel types shown individually before the tail is folded into "Others". The
 * skin carries six chart colours, so five named slices leave one for the tail.
 */
const NAMED_SEGMENTS = 5;

/**
 * The month's registrations by powertrain: a stacked bar of the shares with
 * a ruled legend beneath, as the Hybrid comp draws it.
 */
export async function FuelMix({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const registrations = await getCarsData(month);

  const ranked = registrations.fuelType
    .filter((entry) => entry.count > 0)
    .sort((first, second) => second.count - first.count);

  const named = ranked.slice(0, NAMED_SEGMENTS);
  const tail = ranked.slice(NAMED_SEGMENTS);
  const tailTotal = tail.reduce((total, entry) => total + entry.count, 0);

  const segments: DonutSegment[] = named.map((entry, index) => ({
    color: `var(--chart-${index + 1})`,
    label: entry.name,
    value: entry.count,
  }));

  if (tailTotal > 0) {
    segments.push({
      color: `var(--chart-${NAMED_SEGMENTS + 1})`,
      label: "Others",
      value: tailTotal,
    });
  }

  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Typography.Paragraph color="muted" size="xs" weight="semibold">
        {formatMonthName(month)} by powertrain
      </Typography.Paragraph>
      {segments.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          No registrations recorded for {formatMonthLabel(month)}.
        </Typography.Paragraph>
      ) : (
        <>
          <div
            aria-label={`Registrations by fuel type, ${formatMonthLabel(month)}`}
            className="flex h-4 gap-0.5"
            role="img"
          >
            {segments.map((segment) => (
              <span
                className="block h-full"
                key={segment.label}
                style={{
                  background: segment.color,
                  width: `${((segment.value / total) * 100).toFixed(2)}%`,
                }}
              />
            ))}
          </div>
          <ul className="flex flex-col">
            {segments.map((segment) => (
              <li
                className="flex items-center gap-2.5 border-separator border-b py-2"
                key={segment.label}
              >
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-xs"
                  style={{ background: segment.color }}
                />
                <span className="min-w-0 flex-1 text-sm">{segment.label}</span>
                <span className="font-semibold text-sm tabular-nums">
                  {((segment.value / total) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
