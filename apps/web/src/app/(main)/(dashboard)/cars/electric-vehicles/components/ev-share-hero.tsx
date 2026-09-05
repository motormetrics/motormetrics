import { NumberValue } from "@heroui-pro/react";
import { formatMonthName } from "@web/app/(main)/(dashboard)/cars/components/format-month";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { ELECTRIC_POPULATION_FUEL_TYPE } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { Headline } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";

/** Months of share history drawn under the headline figure. */
const SPARK_MONTHS = 12;

/**
 * The page's opening figure: battery-electric share of the month's new car
 * registrations, with the EV fleet already on the road in the caption.
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

  // `getVehiclePopulationYearlyTotals()` comes back newest year first, and the
  // fuel-type breakdown covers every vehicle class, not cars alone.
  const populationYear = populationTotals.at(0)?.year;
  const electricFleet = populationByFuelType
    .filter(
      (row) =>
        row.year === populationYear &&
        row.fuelType === ELECTRIC_POPULATION_FUEL_TYPE,
    )
    .reduce((sum, row) => sum + row.total, 0);

  return (
    <div className="flex flex-col gap-2">
      <Headline
        caption={
          <>
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={point.BEV}
            />{" "}
            electric cars registered in {formatMonthName(point.month)}
            {electricFleet > 0 ? (
              <>
                {" · "}
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={electricFleet}
                />{" "}
                EVs on the road
              </>
            ) : null}
          </>
        }
        delta={<DeltaChip unit="pp" value={share - previousShare} />}
        label="EV share of new registrations"
        value={`${share.toFixed(1)}%`}
      />
      <SparklineChart
        title={`Battery-electric share of new car registrations over the last ${history.length} months`}
        values={history}
      />
    </div>
  );
}
