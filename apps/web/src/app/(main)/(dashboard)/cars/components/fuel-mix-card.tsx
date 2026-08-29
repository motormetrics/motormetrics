import { NumberValue } from "@heroui-pro/react";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/app/(main)/(dashboard)/cars/components/format-month";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { SurfaceCard } from "@web/components/shared/bento";
import {
  DonutGauge,
  type DonutSegment,
} from "@web/components/shared/donut-gauge";
import Typography from "@web/components/typography";
import { getCarsData } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";

/**
 * Fuel types shown individually before the tail is folded into "Others". The
 * skin carries six chart colours, so five named slices leave one for the tail.
 */
const NAMED_SEGMENTS = 5;

export async function FuelMixCard({
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

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-1">
        <Typography.TextSm>Fuel mix</Typography.TextSm>
        <Typography.H3>By fuel type</Typography.H3>
      </div>

      {segments.length > 0 ? (
        <DonutGauge
          caption={formatMonthName(month)}
          centre={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={registrations.total}
            />
          }
          segments={segments}
          title={`Registrations by fuel type, ${formatMonthLabel(month)}`}
        />
      ) : (
        <Typography.TextSm>
          No registrations recorded for {formatMonthLabel(month)}.
        </Typography.TextSm>
      )}
    </SurfaceCard>
  );
}
