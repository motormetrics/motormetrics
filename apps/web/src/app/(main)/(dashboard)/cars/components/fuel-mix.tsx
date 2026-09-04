import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  type DonutSegment,
  donutArcs,
  RING_RADIUS,
} from "@web/app/(main)/(dashboard)/cars/components/donut-arcs";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/app/(main)/(dashboard)/cars/components/format-month";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { getCarsData } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";

/**
 * Fuel types shown individually before the tail is folded into "Others". The
 * skin carries six chart colours, so five named slices leave one for the tail.
 */
const NAMED_SEGMENTS = 5;

/**
 * The month's registrations by powertrain: the ring with the month total at
 * its centre and the legend beside it, as the v3 comp draws it.
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
  const arcs = donutArcs(segments);

  return (
    <div className="flex flex-col gap-2.5">
      <span className="font-semibold text-muted-strong text-xl">Fuel mix</span>
      <span className="font-medium text-base text-muted">
        {formatMonthName(month)} registrations by powertrain
      </span>

      {segments.length > 0 ? (
        <div className="mt-2 flex flex-wrap items-center gap-9">
          <div className="relative size-[172px] shrink-0">
            <svg className="block" role="img" viewBox="0 0 190 190">
              <title>{`Registrations by fuel type, ${formatMonthLabel(month)}`}</title>
              <g transform="rotate(-90 95 95)">
                {arcs.map((arc) => (
                  <circle
                    cx={95}
                    cy={95}
                    fill="none"
                    key={arc.key}
                    r={RING_RADIUS}
                    stroke={arc.color}
                    strokeDasharray={arc.dashArray}
                    strokeDashoffset={arc.dashOffset}
                    strokeLinecap="round"
                    strokeWidth={24}
                  />
                ))}
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="font-extrabold text-[33px] tabular-nums leading-none tracking-tight">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={registrations.total}
                />
              </span>
              <span className="font-semibold text-muted text-sm">
                {formatMonthName(month)}
              </span>
            </div>
          </div>

          <ul className="flex min-w-48 flex-1 flex-col gap-3">
            {segments.map((segment) => (
              <li className="flex items-center gap-2.5" key={segment.label}>
                <span
                  aria-hidden
                  className="size-[11px] shrink-0 rounded-full"
                  style={{ background: segment.color }}
                />
                <span className="font-semibold text-base text-foreground/85">
                  {segment.label}
                </span>
                <span className="ml-auto font-extrabold text-base tabular-nums">
                  {((segment.value / total) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <Typography.Paragraph color="muted" size="sm">
          No registrations recorded for {formatMonthLabel(month)}.
        </Typography.Paragraph>
      )}
    </div>
  );
}
