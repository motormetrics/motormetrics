import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { EvShareSparkline } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-share-sparkline";
import { ELECTRIC_POPULATION_FUEL_TYPE } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";

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
  const start = Math.max(0, index - SPARK_MONTHS + 1);
  const history = trend.slice(start, index + 1).map((entry, offset) => ({
    label: formatMonthLabel(entry.month),
    value: Number((shares[start + offset] ?? 0).toFixed(1)),
  }));

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

  const monthName = formatMonthName(point.month);
  const previousMonth = trend[index - 1]?.month;

  return (
    <div className="flex flex-col gap-3">
      <Typography.Paragraph color="muted" size="xs" weight="semibold">
        EV share of new registrations · {monthName}
      </Typography.Paragraph>
      <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
        {share.toFixed(1)}%
      </span>
      {previousMonth ? (
        <Typography.Paragraph className="tabular-nums" color="muted">
          <DeltaChip
            className="font-semibold text-foreground"
            unit="pp"
            value={share - previousShare}
          />{" "}
          vs {formatMonthName(previousMonth)}
        </Typography.Paragraph>
      ) : null}
      <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={point.BEV}
        />{" "}
        battery-electric cars registered in {monthName}
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
      </Typography.Paragraph>
      <EvShareSparkline data={history} />
    </div>
  );
}
