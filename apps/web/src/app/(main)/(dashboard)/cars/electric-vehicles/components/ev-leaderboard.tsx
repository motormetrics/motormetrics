import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { batteryElectricMakes } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { SurfaceCard } from "@web/components/shared/bento";
import { getTopMakesByFuelType } from "@web/queries/cars/market-insights";
import { getCarLogo } from "@web/queries/logos";
import Image from "next/image";

const LEADERBOARD_SIZE = 6;

/** Battery-electric registrations by make for the selected month. */
export async function EvLeaderboard({ month }: { month: string }) {
  const fuelTypes = await getTopMakesByFuelType(month);
  const makes = batteryElectricMakes(fuelTypes).slice(0, LEADERBOARD_SIZE);

  if (makes.length === 0) {
    return null;
  }

  const logos = await Promise.all(makes.map(({ make }) => getCarLogo(make)));
  const leader = makes[0]?.count || 1;

  return (
    <SurfaceCard className="gap-4 p-7">
      <div className="flex flex-col gap-1">
        <Typography.Paragraph className="text-muted">
          Leaderboard
        </Typography.Paragraph>
        <Typography.Heading level={3}>EV makes</Typography.Heading>
      </div>

      <ul className="flex flex-col gap-3.5">
        {makes.map((item, index) => {
          const logo = logos[index];

          return (
            <li className="flex flex-col gap-1.5" key={item.make}>
              <div className="flex items-center gap-2.5">
                <span className="flex size-[26px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-accent/15 font-extrabold text-accent-strong text-xs">
                  {logo?.url ? (
                    <Image
                      alt=""
                      className="object-contain"
                      height={20}
                      src={logo.url}
                      width={20}
                    />
                  ) : (
                    item.make.charAt(0)
                  )}
                </span>
                <Typography.Paragraph
                  color="muted"
                  size="sm"
                  className="truncate text-foreground/85"
                >
                  {item.make}
                </Typography.Paragraph>
                <span className="ml-auto font-extrabold text-sm tabular-nums">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={item.count}
                  />
                </span>
              </div>
              <div className="h-3.5 overflow-hidden rounded-full bg-default">
                <div
                  className="h-full rounded-full"
                  style={{
                    background: `var(--chart-${index + 1})`,
                    width: `${(item.count / leader) * 100}%`,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>

      <Typography.Paragraph color="muted" size="xs">
        Battery-electric registrations · {formatDateToMonthYear(month)}
      </Typography.Paragraph>
    </SurfaceCard>
  );
}
