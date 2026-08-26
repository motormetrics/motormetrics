import { NumberValue } from "@heroui-pro/react";
import { InkPanel } from "@web/components/shared/bento";
import Typography from "@web/components/typography";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";
import { Car } from "lucide-react";

/** Fuel types listed individually before the tail is folded into "Others". */
const NAMED_ROWS = 5;

/**
 * The rail's closing ink panel: how many vehicles are actually on the road,
 * against the registrations the rest of the page counts.
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
    <InkPanel>
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-[0.875rem] bg-[var(--accent-on-dark)]/20 text-[var(--accent-on-dark)]">
          <Car aria-hidden className="size-5" />
        </span>
        <Typography.TextSm className="font-semibold text-[var(--accent-foreground)]/85">
          Vehicles on the road
        </Typography.TextSm>
      </div>

      <span className="font-extrabold text-5xl text-[var(--accent-on-dark)] tabular-nums tracking-[-0.03em]">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={latest.total}
        />
      </span>

      <Typography.TextSm className="font-medium text-[var(--accent-foreground)]/60">
        All vehicles registered in Singapore · {latest.year}
        {changeRatio !== null && previous ? (
          <>
            {" · "}
            <NumberValue
              maximumFractionDigits={1}
              signDisplay="exceptZero"
              style="percent"
              value={changeRatio}
            />{" "}
            on {previous.year}
          </>
        ) : null}
      </Typography.TextSm>

      <ul className="flex flex-col gap-3">
        {rows.map((row) => (
          <li className="flex flex-col gap-1.5" key={row.label}>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[14.5px] text-[var(--accent-foreground)]/85">
                {row.label}
              </span>
              <span className="ml-auto font-bold text-[14.5px] text-[var(--accent-foreground)] tabular-nums">
                {((row.total / latest.total) * 100).toFixed(1)}%
              </span>
            </div>
            <span className="block h-2 overflow-hidden rounded-full bg-[var(--accent-foreground)]/10">
              <span
                className="block h-full rounded-full bg-[var(--accent-on-dark)]"
                style={{
                  opacity: row.label === "Electric" ? 1 : 0.45,
                  width: `${((row.total / largestTotal) * 100).toFixed(1)}%`,
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </InkPanel>
  );
}
