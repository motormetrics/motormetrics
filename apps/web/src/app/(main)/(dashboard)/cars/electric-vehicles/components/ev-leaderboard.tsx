import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import { yearToDateMakes } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { EV_FUEL_TYPES } from "@web/config";
import { getFuelTypeData } from "@web/queries/cars";
import { getCarLogoMap } from "@web/queries/logos";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import Link from "next/link";

const LEADERBOARD_SIZE = 6;

/** Battery-electric registrations by make, year to date at the selected month. */
export async function EvLeaderboard({ month }: { month: string }) {
  const [electric, logoUrlBySlug] = await Promise.all([
    getFuelTypeData(EV_FUEL_TYPES.BEV[0]),
    getCarLogoMap(),
  ]);

  const makes = yearToDateMakes(electric.data, EV_FUEL_TYPES.BEV, month).slice(
    0,
    LEADERBOARD_SIZE,
  );

  if (makes.length === 0) {
    return null;
  }

  const leader = makes[0]?.count || 1;

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`Battery-electric registrations · ${month.slice(0, 4)} to ${formatMonthName(month)}`}
        eyebrow="Makes"
        link={{ href: "/cars/makes", label: "All makes" }}
        title="EV makes"
      />

      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="w-5">#</span>
          <span className="min-w-0 flex-1 md:w-36 md:flex-none">Make</span>
          <span className="min-w-0 flex-1 max-md:hidden" />
          <span className="w-16 text-right">Cars</span>
        </div>
        <ol className="flex flex-col">
          {makes.map((item, index) => {
            const slug = slugify(item.make);

            return (
              <li
                className="flex items-center gap-3 border-separator border-b py-2 hover:bg-surface-secondary"
                key={item.make}
              >
                <span className="w-5 text-muted text-sm tabular-nums">
                  {index + 1}
                </span>
                <Link
                  className="flex min-w-0 flex-1 items-center gap-2.5 text-inherit no-underline transition-colors hover:text-accent-strong md:w-36 md:flex-none"
                  href={`/cars/makes/${slug}`}
                >
                  <MakeAvatar
                    logoUrl={logoUrlBySlug[slug] ?? null}
                    make={item.make}
                    size="sm"
                  />
                  <span className="truncate font-medium text-sm">
                    {item.make}
                  </span>
                </Link>
                <span
                  aria-hidden
                  className="block h-2.5 min-w-0 flex-1 bg-default max-md:hidden"
                >
                  <span
                    className="block h-full rounded-r-xs"
                    style={{
                      background:
                        index === 0 ? "var(--chart-1)" : "var(--chart-3)",
                      width: `${((item.count / leader) * 100).toFixed(1)}%`,
                    }}
                  />
                </span>
                <span className="w-16 text-right font-semibold text-sm tabular-nums">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={item.count}
                  />
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      <SourceNote>
        Year to date, January to {formatMonthLabel(month)}. Top six makes by
        battery-electric registrations.
      </SourceNote>
    </section>
  );
}
