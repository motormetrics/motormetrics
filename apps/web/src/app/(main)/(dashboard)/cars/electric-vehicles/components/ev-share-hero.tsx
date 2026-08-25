import { Link } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { DeltaPill } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/delta-pill";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { ELECTRIC_POPULATION_FUEL_TYPE } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import Typography from "@web/components/typography";
import { sparkline } from "@web/components/v2/sparkline";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";
import { ArrowUpRight } from "lucide-react";

const SPARK_WIDTH = 380;
const SPARK_HEIGHT = 100;
/** Months of share history drawn behind the headline figure. */
const SPARK_MONTHS = 12;

/**
 * The page's dark feature surface: battery-electric share of the month's new
 * car registrations, with the EV fleet already on the road inset beneath it.
 */
export async function EvShareHero({ month }: { month: string }) {
  const [trend, marketShare, populationByFuelType, populationTotals] =
    await Promise.all([
      getEvMonthlyTrend(),
      getEvMarketShare(),
      getVehiclePopulationByYearAndFuelType(),
      getVehiclePopulationYearlyTotals(),
    ]);

  const index = resolveMonthIndex(
    trend.map((point) => point.month),
    month,
  );
  const point = trend[index];

  if (!point) {
    return null;
  }

  const shares = batteryElectricShares(trend, marketShare);
  const share = shares[index] ?? 0;
  const previousShare = index > 0 ? (shares[index - 1] ?? 0) : share;
  const history = shares.slice(
    Math.max(0, index - SPARK_MONTHS + 1),
    index + 1,
  );
  const spark = sparkline(history, SPARK_WIDTH, SPARK_HEIGHT);

  // The fleet figure covers the whole motor vehicle population rather than cars
  // alone: `getVehiclePopulationByYearAndFuelType()` aggregates every class.
  const populationYear = populationTotals.at(0)?.year;
  const fleetTotal = populationTotals.at(0)?.total ?? 0;
  const electricFleet = populationByFuelType
    .filter(
      (row) =>
        row.year === populationYear &&
        row.fuelType === ELECTRIC_POPULATION_FUEL_TYPE,
    )
    .reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-[var(--ink-surface)] p-8 shadow-surface">
      <div className="flex flex-col items-start gap-2.5">
        <span className="rounded-full bg-[var(--accent-on-dark)]/20 px-4 py-2 font-bold text-[var(--accent-on-dark)] text-sm">
          EV share · {formatDateToMonthYear(point.month)}
        </span>

        <div className="flex flex-wrap items-center gap-4">
          <span className="font-extrabold text-[3.5rem] text-[var(--accent-on-dark)] tabular-nums tracking-[-0.03em] lg:text-[4.5rem]">
            {share.toFixed(1)}%
          </span>
          <DeltaPill tone="on-dark" value={share - previousShare} />
        </div>

        <Typography.TextLg className="font-semibold text-[var(--accent-foreground)]/70">
          of new car registrations ·{" "}
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={point.BEV}
          />{" "}
          battery-electric cars this month
        </Typography.TextLg>
      </div>

      {spark ? (
        <svg
          className="h-[100px] w-full overflow-visible"
          role="img"
          viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`}
        >
          <title>{`Battery-electric share of new car registrations over the last ${history.length} months`}</title>
          <path d={spark.area} fill="var(--accent-on-dark)" opacity={0.16} />
          <path
            d={spark.line}
            fill="none"
            stroke="var(--accent-on-dark)"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
          />
          <circle
            cx={spark.lastX}
            cy={spark.lastY}
            fill="var(--ink-surface)"
            r={6}
            stroke="var(--accent-on-dark)"
            strokeWidth={3.5}
          />
        </svg>
      ) : null}

      {populationYear && electricFleet > 0 ? (
        <div className="flex items-center gap-3.5 rounded-[var(--radius)] bg-[var(--accent-foreground)]/[0.06] px-6 py-5">
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="font-bold text-[var(--accent-foreground)] text-xl tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={electricFleet}
              />{" "}
              EVs on the road
            </span>
            <Typography.Caption className="text-[var(--accent-foreground)]/65">
              {fleetTotal > 0
                ? `${((electricFleet / fleetTotal) * 100).toFixed(1)}% of the vehicle population`
                : "share of the vehicle population"}{" "}
              · {populationYear}
            </Typography.Caption>
          </div>
          <Link
            aria-label="View the annual vehicle population"
            className="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-accent text-[var(--accent-deep)] transition-[filter] hover:brightness-110"
            href="/cars/annual"
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
