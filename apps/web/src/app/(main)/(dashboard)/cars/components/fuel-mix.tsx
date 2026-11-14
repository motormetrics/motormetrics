import { Typography } from "@heroui/react";
import { KeyNumberList } from "@web/app/(main)/(dashboard)/cars/components/keys-aside";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { getCarsData } from "@web/queries/cars";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/** Fuel types shown individually before the tail is folded into "Others". */
const NAMED_SEGMENTS = 4;

/**
 * The month's registrations by powertrain, as Direction D's key numbers: a
 * stacked share bar over one ruled figure per fuel type.
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

  const segments = ranked.slice(0, NAMED_SEGMENTS).map((entry, index) => ({
    color: `var(--chart-${index + 1})`,
    label: entry.name,
    value: entry.count,
  }));
  const tailTotal = ranked
    .slice(NAMED_SEGMENTS)
    .reduce((total, entry) => total + entry.count, 0);

  if (tailTotal > 0) {
    segments.push({
      color: `var(--chart-${NAMED_SEGMENTS + 1})`,
      label: "Others",
      value: tailTotal,
    });
  }

  if (segments.length === 0) {
    return (
      <Typography.Paragraph color="muted" size="sm">
        No registrations recorded for {formatMonthLabel(month)}.
      </Typography.Paragraph>
    );
  }

  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  const share = (value: number) => `${((value / total) * 100).toFixed(1)}%`;

  return (
    <>
      <div
        aria-label={`Registrations by fuel type, ${formatMonthLabel(month)}`}
        className="flex h-4 gap-0.5"
        role="img"
      >
        {segments.map((segment) => (
          <span
            className="block h-full rounded-xs"
            key={segment.label}
            style={{ background: segment.color, width: share(segment.value) }}
          />
        ))}
      </div>
      <KeyNumberList
        items={segments.map((segment) => ({
          label: (
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-xs"
                style={{ background: segment.color }}
              />
              {segment.label}
            </span>
          ),
          note: `of new cars in ${formatMonthName(month)}`,
          value: share(segment.value),
        }))}
      />
    </>
  );
}
