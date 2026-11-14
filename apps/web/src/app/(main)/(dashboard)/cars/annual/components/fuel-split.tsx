import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { KeyNumberList } from "@web/app/(main)/(dashboard)/cars/components/keys-aside";
import { SourceNote } from "@web/components/shared/overview";

/** Fuel types listed individually before the tail is folded into "Others". */
const NAMED_SEGMENTS = 5;

const OTHERS = "Others";

/** The comp's colour for each LTA fuel label; anything else takes the last. */
const FUEL_COLOURS: Record<string, string> = {
  Diesel: "var(--chart-sand)",
  Electric: "var(--chart-5)",
  Petrol: "var(--chart-1)",
  "Petrol-Electric": "var(--chart-3)",
  "Petrol-Electric (Plug-In)": "var(--muted)",
};

const FALLBACK_COLOUR = "var(--chart-6)";

/**
 * The fuel split at the latest year end, as Direction D's key numbers: one
 * stacked share bar, then a ruled figure per fuel type, largest first.
 *
 * Labels are LTA's own — "Petrol-Electric" and "Petrol-Electric (Plug-In)"
 * stay apart rather than being folded into a "hybrid" bucket LTA does not
 * publish.
 */
export function FuelSplit({
  entity,
  year,
}: {
  entity: PopulationEntity;
  year: string;
}) {
  const ranked = entity.fuel.filter((row) => row.value > 0);
  const total = ranked.reduce((sum, row) => sum + row.value, 0);

  const segments = ranked.slice(0, NAMED_SEGMENTS).map((row) => ({
    label: row.label,
    value: row.value,
  }));

  const tailTotal = ranked
    .slice(NAMED_SEGMENTS)
    .reduce((sum, row) => sum + row.value, 0);

  if (tailTotal > 0) {
    // LTA publishes an "Others" fuel of its own, so the tail joins that row
    // where it is already named rather than listing a second one.
    const existing = segments.find((segment) => segment.label === OTHERS);
    if (existing) {
      existing.value += tailTotal;
    } else {
      segments.push({ label: OTHERS, value: tailTotal });
    }
  }

  const rows = segments.map((segment) => ({
    ...segment,
    color: FUEL_COLOURS[segment.label] ?? FALLBACK_COLOUR,
    share: total > 0 ? (segment.value / total) * 100 : 0,
  }));

  if (rows.length === 0) {
    return (
      <SourceNote>
        LTA published the {year} count for {entity.name.toLowerCase()} without a
        fuel split.
      </SourceNote>
    );
  }

  return (
    <>
      <div
        aria-label={rows
          .map((row) => `${row.label} ${row.share.toFixed(1)}%`)
          .join(", ")}
        className="flex h-4 gap-0.5"
        role="img"
      >
        {rows.map((row) => (
          <span
            className="block h-full rounded-xs"
            key={row.label}
            style={{ background: row.color, width: `${row.share}%` }}
          />
        ))}
      </div>
      <KeyNumberList
        items={rows.map((row) => ({
          label: (
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-xs"
                style={{ background: row.color }}
              />
              {row.label}
            </span>
          ),
          value: `${row.share.toFixed(1)}%`,
        }))}
      />
    </>
  );
}
