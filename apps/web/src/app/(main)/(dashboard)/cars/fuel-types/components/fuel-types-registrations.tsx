import { Typography } from "@heroui/react";
import { summariseMix } from "@web/app/(main)/(dashboard)/cars/components/category/type-summary";
import { FuelTable } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-table";
import type { FuelMixRow } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-headline";
import { percentageOf } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { FUEL_TYPE_LINKS } from "@web/config";

/**
 * The table's description column is authored copy, not data. Reusing the
 * navigation descriptions keeps one wording per fuel type across the site;
 * `Others` has no navigation entry because it has no detail page worth linking.
 */
const DESCRIPTIONS: Record<string, string> = {
  ...Object.fromEntries(
    FUEL_TYPE_LINKS.filter(({ description }) => description).map(
      ({ description, label }) => [label, description as string],
    ),
  ),
  Others: "Fuel types LTA does not report separately",
};

/** Every fuel type LTA recorded in the period, against a year earlier. */
export function FuelTypesRegistrations({
  mix,
  period,
  periodLabel,
  priorByName,
  priorTotal,
  total,
  year,
}: {
  mix: FuelMixRow[];
  period: "month" | "ytd";
  periodLabel: string;
  priorByName: Map<string, number>;
  priorTotal: number;
  total: number;
  year: number;
}) {
  const summary = summariseMix(
    periodLabel,
    mix.map(({ name, share }) => ({ label: name, share })),
  );

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${periodLabel} · ${mix.length} recorded by LTA`}
        eyebrow="Registrations"
        title="All fuel types"
      />
      <FuelTable
        countLabel={period === "ytd" ? "Year to date" : "Cars"}
        rows={mix.map(({ color, count, name, share }) => ({
          change: share - percentageOf(priorByName.get(name) ?? 0, priorTotal),
          color,
          count,
          description: DESCRIPTIONS[name] ?? "—",
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
        Share is of {total.toLocaleString("en-SG")} new cars. Change is in
        percentage points against the same period of {year - 1}; colour is not
        used for direction. Select a column heading to sort.
      </SourceNote>
    </section>
  );
}
