import { NumberValue } from "@heroui-pro/react";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { donutArcs } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead } from "@web/components/shared/overview";
import { getYearToDateByFuelType } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";

const RADIUS = 74;
/** Arc length removed from each segment so the rounded caps read as separate. */
const SEGMENT_GAP = 16;

/**
 * The powertrains the ring shows, in drawing order. LTA records hybrids as
 * `Petrol-Electric`, `Diesel-Electric` and their plug-in variants, so anything
 * with an `-Electric` suffix folds into one hybrid slice.
 */
const POWERTRAINS = [
  {
    color: "var(--chart-1)",
    label: "Petrol",
    match: (name: string) => name === "Petrol",
  },
  {
    color: "var(--chart-3)",
    label: "Electric",
    match: (name: string) => name === "Electric",
  },
  {
    color: "var(--chart-5)",
    label: "Hybrid",
    match: (name: string) => name.includes("-Electric"),
  },
  {
    color: "var(--chart-2)",
    label: "Diesel",
    match: (name: string) => name === "Diesel",
  },
];

const OTHER = { color: "var(--chart-6)", label: "Other" };

/** Registrations by powertrain for the selected month's year. */
export async function FuelMix({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const year = Number(month.slice(0, 4));
  const fuelTypes = await getYearToDateByFuelType(year);

  const total = fuelTypes.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return null;
  }

  const slices = POWERTRAINS.map((powertrain) => ({
    color: powertrain.color,
    label: powertrain.label,
    value: fuelTypes
      .filter((item) => powertrain.match(item.name))
      .reduce((sum, item) => sum + item.count, 0),
  }));
  const accounted = slices.reduce((sum, slice) => sum + slice.value, 0);
  if (total > accounted) {
    slices.push({ ...OTHER, value: total - accounted });
  }

  const segments = slices.filter((slice) => slice.value > 0);
  const arcs = donutArcs(segments, RADIUS, SEGMENT_GAP);

  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        caption={`${year} year to date · by powertrain`}
        eyebrow="Registrations"
        link={{ href: "/cars/fuel-types", label: "All fuel types" }}
        title="Fuel mix"
      />
      <div className="flex flex-wrap items-center gap-9">
        <div className="relative size-[172px] shrink-0">
          <svg className="block size-[172px]" role="img" viewBox="0 0 190 190">
            <title>{`Registrations by powertrain, ${year} year to date`}</title>
            <g transform="rotate(-90 95 95)">
              {arcs.map((arc) => (
                <circle
                  cx={95}
                  cy={95}
                  fill="none"
                  key={arc.key}
                  r={RADIUS}
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
            <span className="font-extrabold text-[33px] tabular-nums tracking-tight">
              <NumberValue
                maximumFractionDigits={1}
                notation="compact"
                value={total}
              />
            </span>
            <span className="font-semibold text-muted text-sm">
              registrations
            </span>
          </div>
        </div>

        <ul className="flex min-w-[180px] flex-1 flex-col gap-3">
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
    </section>
  );
}
