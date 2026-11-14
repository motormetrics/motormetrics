import { Skeleton } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import { SelectedMonthName } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-head";
import type { SelectionProps } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import { yearToDateMakes } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { SubHead } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/sub-head";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SourceNote } from "@web/components/shared/overview";
import { EV_FUEL_TYPES } from "@web/config";
import { getFuelTypeData } from "@web/queries/cars";
import { getCarLogoMap } from "@web/queries/logos";
import Link from "next/link";
import { Suspense } from "react";

export const LEADERBOARD_SIZE = 6;

/** Battery-electric registrations by make, year to date at `month`. */
export async function loadEvMakes(month: string) {
  const electric = await getFuelTypeData(EV_FUEL_TYPES.BEV[0]);

  return yearToDateMakes(electric.data, EV_FUEL_TYPES.BEV, month);
}

async function Leaderboard({ selection }: SelectionProps) {
  const { month } = await selection;
  const [ranking, logoUrlBySlug] = await Promise.all([
    loadEvMakes(month),
    getCarLogoMap(),
  ]);
  const makes = ranking.slice(0, LEADERBOARD_SIZE);
  const leader = makes[0]?.count || 1;

  return (
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
              <span className="truncate font-medium text-sm">{item.make}</span>
            </Link>
            <span
              aria-hidden
              className="block h-2.5 min-w-0 flex-1 bg-default max-md:hidden"
            >
              <span
                className="block h-full rounded-r-xs"
                style={{
                  background: index === 0 ? "var(--chart-1)" : "var(--chart-3)",
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
  );
}

/** One half of Figure 3: the year's leading battery-electric makes. */
export function EvLeaderboard({ selection }: SelectionProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <SubHead
        link={{ href: "/cars/makes", label: "All makes" }}
        sub={
          <>
            Battery-electric registrations · year to{" "}
            <Suspense fallback=" ">
              <SelectedMonthName selection={selection} />
            </Suspense>
          </>
        }
        title="EV makes"
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="w-5">#</span>
          <span className="min-w-0 flex-1 md:w-36 md:flex-none">Make</span>
          <span className="min-w-0 flex-1 max-md:hidden" />
          <span className="w-16 text-right">Cars</span>
        </div>
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <Leaderboard selection={selection} />
        </Suspense>
      </div>
      <SourceNote>
        Year to date, from January to the selected month. Top six makes by
        battery-electric registrations.
      </SourceNote>
    </div>
  );
}
