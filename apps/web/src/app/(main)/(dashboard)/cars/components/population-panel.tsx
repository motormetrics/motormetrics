import { Chip } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { BarRow } from "@web/components/shared/bar-row";
import { Headline, SectionHead } from "@web/components/shared/overview";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";

/** Fuel types listed individually before the tail is folded into "Others". */
const NAMED_ROWS = 5;

/** Ranks past this share the last chart colour rather than wrapping around. */
const CHART_COLOURS = 6;

/**
 * How many vehicles are actually on the road, against the registrations the
 * rest of the page counts.
 */
export async function PopulationPanel() {
  const [yearlyTotals, byFuelType] = await Promise.all([
    getVehiclePopulationYearlyTotals(),
    getVehiclePopulationByYearAndFuelType(),
  ]);

  const latest = yearlyTotals[0];
  if (!latest) {
    return null;
  }

  const previous = yearlyTotals[1];
  const changeRatio =
    previous && previous.total > 0
      ? (latest.total - previous.total) / previous.total
      : null;

  const ranked = byFuelType
    .filter((row) => row.year === latest.year && row.total > 0)
    .sort((first, second) => second.total - first.total);

  const tailTotal = ranked
    .slice(NAMED_ROWS)
    .reduce((total, row) => total + row.total, 0);

  const rows = ranked.slice(0, NAMED_ROWS).map((row) => ({
    label: row.fuelType,
    total: row.total,
  }));

  if (tailTotal > 0) {
    rows.push({ label: "Others", total: tailTotal });
  }

  const largestTotal = rows[0]?.total ?? 1;

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`All vehicles registered in Singapore · ${latest.year}`}
        eyebrow="Vehicle population"
        link={{ href: "/cars/annual", label: "Population data" }}
        title="Cars on the road"
      />

      <Headline
        delta={
          changeRatio !== null && previous ? (
            <Chip
              className="rounded-full bg-accent-soft font-bold text-accent-strong tabular-nums"
              size="lg"
              variant="soft"
            >
              <Chip.Label>
                <NumberValue
                  maximumFractionDigits={1}
                  signDisplay="exceptZero"
                  style="percent"
                  value={changeRatio}
                />{" "}
                on {previous.year}
              </Chip.Label>
            </Chip>
          ) : undefined
        }
        size="md"
        value={
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={latest.total}
          />
        }
      />

      <ul className="flex flex-col gap-3.5">
        {rows.map((row, index) => (
          <li key={row.label}>
            <BarRow
              color={`var(--chart-${Math.min(CHART_COLOURS, index + 1)})`}
              label={row.label}
              share={(row.total / largestTotal) * 100}
              value={`${((row.total / latest.total) * 100).toFixed(1)}%`}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
