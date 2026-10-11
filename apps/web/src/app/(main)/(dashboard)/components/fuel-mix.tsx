import { NumberValue } from "@heroui-pro/react";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getYearToDateByFuelType } from "@web/queries/cars";
import { getLatestMonth } from "@web/utils/dates/months";

/**
 * The powertrains the bar shows. LTA records hybrids as `Petrol-Electric`,
 * `Diesel-Electric` and their plug-in variants, so anything with an
 * `-Electric` suffix folds into one hybrid segment.
 */
const POWERTRAINS = [
  {
    color: "var(--chart-1)",
    label: "Electric",
    match: (name: string) => name === "Electric",
  },
  {
    color: "var(--chart-3)",
    label: "Hybrid",
    match: (name: string) => name.includes("-Electric"),
  },
  {
    color: "var(--chart-sand)",
    label: "Petrol",
    match: (name: string) => name === "Petrol",
  },
  {
    color: "var(--muted)",
    label: "Diesel",
    match: (name: string) => name === "Diesel",
  },
];

const OTHER = { color: "var(--chart-5)", label: "Other" };

/**
 * Registrations by powertrain for the year to date: one stacked share bar,
 * then a row per powertrain, largest first.
 */
export async function FuelMix() {
  const month = await getLatestMonth("cars");
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
  const segments = slices
    .map((slice) => ({ ...slice, share: (slice.value / total) * 100 }))
    .sort((left, right) => right.value - left.value);

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${year} year to date · by powertrain`}
        eyebrow="Registrations"
        link={{ href: "/cars/fuel-types", label: "All fuel types" }}
        title="Fuel mix"
      />

      <div
        aria-label={segments
          .map((segment) => `${segment.label} ${segment.share.toFixed(1)}%`)
          .join(", ")}
        className="flex h-4 gap-0.5"
        role="img"
      >
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <span
              className="block h-full"
              key={segment.label}
              style={{ background: segment.color, width: `${segment.share}%` }}
            />
          ))}
      </div>

      <ul className="flex flex-col">
        {segments.map((segment) => (
          <li
            className="flex items-center gap-2.5 border-separator border-b py-2.5"
            key={segment.label}
          >
            <span
              aria-hidden
              className="block size-3 shrink-0 rounded-xs"
              style={{ background: segment.color }}
            />
            <span className="min-w-0 flex-1 text-sm">{segment.label}</span>
            <span className="w-16 shrink-0 text-right font-semibold text-sm tabular-nums">
              {segment.share.toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>

      <SourceNote>
        Share of{" "}
        <NumberValue locale="en-SG" maximumFractionDigits={0} value={total} />{" "}
        new car registrations. Hybrid includes plug-in hybrids.
      </SourceNote>
    </section>
  );
}
