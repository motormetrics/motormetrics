import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils";
import { yearToDateMakes } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { EV_FUEL_TYPES } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { buildLogoMap } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { BarRow } from "@web/components/shared/bar-row";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead } from "@web/components/shared/overview";
import { getFuelTypeData } from "@web/queries/cars";
import { getAllCarLogos } from "@web/queries/logos";
import Link from "next/link";

const LEADERBOARD_SIZE = 6;

/** Battery-electric registrations by make, year to date at the selected month. */
export async function EvLeaderboard({ month }: { month: string }) {
  const [electric, logoResult] = await Promise.all([
    getFuelTypeData(EV_FUEL_TYPES.BEV[0]),
    getAllCarLogos(),
  ]);

  const makes = yearToDateMakes(electric.data, EV_FUEL_TYPES.BEV, month).slice(
    0,
    LEADERBOARD_SIZE,
  );

  if (makes.length === 0) {
    return null;
  }

  const logoUrlBySlug = buildLogoMap(
    "logos" in logoResult ? logoResult.logos : [],
  );
  const leader = makes[0]?.count || 1;

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`Battery-electric registrations · ${month.slice(0, 4)} year to date`}
        eyebrow="Leaderboard"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="EV makes"
      />

      <ul className="flex flex-col gap-3.5">
        {makes.map((item, index) => {
          const slug = slugify(item.make);

          return (
            <li key={item.make}>
              <BarRow
                color={`var(--chart-${index + 1})`}
                label={
                  <Link
                    className="flex min-w-0 items-center gap-2.5 text-inherit no-underline transition-colors hover:text-accent-strong"
                    href={`/cars/makes/${slug}`}
                  >
                    <MakeAvatar
                      logoUrl={logoUrlBySlug[slug] ?? null}
                      make={item.make}
                      size={28}
                    />
                    <Typography.Paragraph
                      className="[color:inherit] [font-weight:inherit]"
                      truncate
                    >
                      {item.make}
                    </Typography.Paragraph>
                  </Link>
                }
                share={(item.count / leader) * 100}
                value={
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={item.count}
                  />
                }
              />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
