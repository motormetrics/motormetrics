import { Link } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear, slugify } from "@motormetrics/utils";
import { electrifiedMakes } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import Typography from "@web/components/typography";
import { getTopMakesByFuelType } from "@web/queries/cars/market-insights";

const RAIL_SIZE = 6;

export async function TopMakesRail({ month }: { month: string }) {
  const fuelTypes = await getTopMakesByFuelType(month);
  const ranking = electrifiedMakes(fuelTypes);
  const monthTotal = ranking.reduce((sum, item) => sum + item.count, 0) || 1;

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
              className="flex items-center gap-3.5 rounded-[var(--radius)] bg-surface px-4 py-3.5 text-foreground transition-shadow hover:shadow-surface"
              href={`/cars/makes/${slugify(item.make)}`}
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] font-extrabold text-[var(--accent-strong)] text-lg">
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
                  />{" "}
                  · {((item.count / monthTotal) * 100).toFixed(1)}% of EVs
                </Typography.Caption>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
