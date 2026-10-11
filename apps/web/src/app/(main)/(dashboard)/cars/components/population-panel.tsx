import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { Headline, SectionHead } from "@web/components/shared/overview";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";

/** Fuel types listed individually before the tail is folded into "Others". */
const NAMED_ROWS = 5;

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
    <div className="flex flex-col gap-4">
      <SectionHead
        caption={`All vehicles registered in Singapore · ${latest.year}`}
        eyebrow="Vehicle population"
        link={{ href: "/cars/annual", label: "Population data" }}
        title="Cars on the road"
      />

      <Headline
        delta={
          changeRatio !== null && previous ? (
            <span className="text-muted-strong tabular-nums">
              {changeRatio < 0 ? "−" : "+"}
              <NumberValue
                maximumFractionDigits={1}
                style="percent"
                value={Math.abs(changeRatio)}
              />{" "}
              on {previous.year}
            </span>
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

      <div className="flex flex-col">
        <div className="flex items-end gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="w-44 shrink-0 max-md:w-auto max-md:flex-1">
            Fuel type
          </span>
          <span className="flex-1 max-md:w-24 max-md:flex-none" />
          <span className="w-14 shrink-0 text-right">Share</span>
        </div>
        <ul className="flex flex-col">
          {rows.map((row, index) => (
            <li
              className="flex items-center gap-3 border-separator border-b py-2"
              key={row.label}
            >
              <span className="w-44 shrink-0 truncate text-sm max-md:w-auto max-md:min-w-0 max-md:flex-1">
                {row.label}
              </span>
              <span className="block h-2.5 flex-1 bg-surface-secondary max-md:w-24 max-md:flex-none">
                <span
                  className={cn(
                    "block h-full",
                    index === 0 ? "bg-chart-1" : "bg-chart-3",
                  )}
                  style={{
                    width: `${((row.total / largestTotal) * 100).toFixed(1)}%`,
                  }}
                />
              </span>
              <span className="w-14 shrink-0 text-right font-semibold text-sm tabular-nums">
                {((row.total / latest.total) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
