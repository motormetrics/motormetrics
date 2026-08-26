import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear, slugify } from "@motormetrics/utils";
import {
  electrifiedMakes,
  powertrainTotal,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import Typography from "@web/components/typography";
import { getEvMonthlyTrend } from "@web/queries/cars";
import { getTopMakesByFuelType } from "@web/queries/cars/market-insights";
import Link from "next/link";

const RAIL_SIZE = 6;

export async function TopMakesRail({ month }: { month: string }) {
  const [fuelTypes, trend] = await Promise.all([
    getTopMakesByFuelType(month),
    getEvMonthlyTrend(),
  ]);
  const ranking = electrifiedMakes(fuelTypes);

  /* `getTopMakesByFuelType` returns the top five makes per fuel type, so the
   * tail is missing by construction. Summing the ranking therefore yields a
   * subtotal, and dividing by it inflates every share: BYD read 31.7% of a
   * 3,628 subtotal in March 2026 where its true share of the month's 4,754
   * electrified registrations is 24.2%. Ranking survives the truncation;
   * a denominator does not, so take it from the trend, which counts them all. */
  const point =
    trend[
      resolveMonthIndex(
        trend.map((entry) => entry.month),
        month,
      )
    ];
  const monthTotal = point ? powertrainTotal(point, "all") : 0;

  if (ranking.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Typography.Text className="font-semibold text-muted">
          Top EV makes · tap to compare
        </Typography.Text>
        <Typography.H3 className="font-bold tracking-[-0.02em]">
          {formatDateToMonthYear(month)} ranking
        </Typography.H3>
      </div>

      <ol className="flex flex-col gap-2">
        {ranking.slice(0, RAIL_SIZE).map((item, index) => (
          <li key={item.make}>
            <Link
              className="flex items-center gap-3.5 rounded-field bg-surface px-4 py-3.5 text-foreground transition-shadow hover:shadow-surface"
              href={`/cars/makes/${slugify(item.make)}`}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/15 font-extrabold text-accent-strong text-lg">
                {index + 1}
              </span>
              <span className="flex min-w-0 flex-col gap-px">
                <span className="truncate font-bold text-[17px]">
                  {item.make}
                </span>
                <Typography.Caption className="text-muted tabular-nums">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={item.count}
                  />
                  {monthTotal > 0
                    ? ` · ${((item.count / monthTotal) * 100).toFixed(1)}% of EVs`
                    : " registered"}
                </Typography.Caption>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
