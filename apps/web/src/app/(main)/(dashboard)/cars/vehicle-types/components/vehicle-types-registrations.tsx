import { Typography } from "@heroui/react";
import { summariseMix } from "@web/app/(main)/(dashboard)/cars/components/category/type-summary";
import { VehicleTable } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-table";
import type { VehicleMixRow } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-headline";
import { percentageOf } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { ElectricShare } from "@web/queries/cars/category-report";

/**
 * The table's description column is authored copy, not data — there is no
 * equivalent of `FUEL_TYPE_LINKS` descriptions for vehicle types, so these are
 * written here. Keys are the values exactly as LTA records them.
 */
const DESCRIPTIONS: Record<string, string> = {
  "Coupe/Convertible": "Two doors, with a fixed or folding roof",
  Hatchback: "Rear door opens onto the cabin, with no separate boot",
  "Multi-purpose Vehicle": "Tall single-volume cabin, usually with a third row",
  "Multi-purpose Vehicle/Station-wagon":
    "MPVs and station-wagons, recorded by LTA as one class",
  Others: "Vehicle types LTA does not report separately",
  Sedan: "Separate enclosed boot behind the cabin",
  "Sports Utility Vehicle": "Raised ride height, often with all-wheel drive",
  "Station-wagon": "Extended roof over the load area, tailgate at the rear",
};

/** Every vehicle type LTA recorded in the period, against a year earlier. */
export function VehicleTypesRegistrations({
  electricShares,
  mix,
  period,
  periodLabel,
  periodSpan,
  priorByName,
  priorTotal,
  year,
}: {
  electricShares: ElectricShare[];
  /** The mix rows, keyed by LTA's own value as well as the display label. */
  mix: (VehicleMixRow & { name: string })[];
  period: "month" | "ytd";
  periodLabel: string;
  periodSpan: string;
  priorByName: Map<string, number>;
  priorTotal: number;
  year: number;
}) {
  const electricByName = new Map(
    electricShares.map(({ electric, name, total: typeTotal }) => [
      name,
      percentageOf(electric, typeTotal),
    ]),
  );
  const summary = summariseMix(periodSpan, mix);

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${periodLabel} · ${mix.length} recorded by LTA · select a column heading to sort`}
        eyebrow="Registrations"
        title="All vehicle types"
      />
      <VehicleTable
        countLabel={period === "ytd" ? "Year to date" : "Registrations"}
        rows={mix.map(({ color, count, label, name, share }) => ({
          change: share - percentageOf(priorByName.get(name) ?? 0, priorTotal),
          color,
          count,
          description: DESCRIPTIONS[name] ?? "—",
          electric: electricByName.get(name) ?? null,
          label,
          name,
          share,
        }))}
        yearAgoLabel={String(year - 1)}
      />
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
      <SourceNote>
        Electric is the battery-electric share of each type. Change is in
        percentage points of share against the same period in {year - 1}. Colour
        is not used for direction.
      </SourceNote>
    </section>
  );
}
