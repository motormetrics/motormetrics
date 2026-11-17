import { Skeleton } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import { EvMakesTable } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-makes-table";
import type { SelectionProps } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import { yearToDateMakes } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { FigureCard } from "@web/components/shared/figure-card";
import { EV_FUEL_TYPES } from "@web/config";
import { getFuelTypeData } from "@web/queries/cars";
import { getCarLogoMap } from "@web/queries/logos";
import { formatMonthName } from "@web/utils/dates/format-month";
import { Suspense } from "react";

const TOP_MAKES = 10;

/** Battery-electric registrations by make, year to date at `month`. */
async function loadEvMakes(month: string) {
  const electric = await getFuelTypeData(EV_FUEL_TYPES.BEV[0]);

  return yearToDateMakes(electric.data, EV_FUEL_TYPES.BEV, month);
}

async function Period({ selection }: SelectionProps) {
  const { month } = await selection;

  return `${month.slice(0, 4)}, January to ${formatMonthName(month)}`;
}

async function Leaderboard({ selection }: SelectionProps) {
  const { month } = await selection;
  const [ranking, logoUrlBySlug] = await Promise.all([
    loadEvMakes(month),
    getCarLogoMap(),
  ]);
  const total = ranking.reduce((sum, item) => sum + item.count, 0) || 1;

  return (
    <EvMakesTable
      label={`Top ${TOP_MAKES} battery-electric makes, year to ${formatMonthName(month)}`}
      rows={ranking.slice(0, TOP_MAKES).map((item, index) => {
        const slug = slugify(item.make);
        return {
          count: item.count,
          logoUrl: logoUrlBySlug[slug] ?? null,
          make: item.make,
          rank: index + 1,
          share: (item.count / total) * 100,
          slug,
        };
      })}
    />
  );
}

/** The year's leading battery-electric makes, as a table. */
export function EvMakesCard({ selection }: SelectionProps) {
  return (
    <FigureCard
      description={
        <>
          Battery-electric registrations,{" "}
          <Suspense fallback=" ">
            <Period selection={selection} />
          </Suspense>
        </>
      }
      link={{ href: "/cars/makes", label: "All makes" }}
      title={<>Top {TOP_MAKES} EV makes</>}
    >
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <Leaderboard selection={selection} />
      </Suspense>
    </FigureCard>
  );
}
