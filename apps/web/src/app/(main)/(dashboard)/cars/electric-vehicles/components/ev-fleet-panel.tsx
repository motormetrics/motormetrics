import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { ELECTRIC_POPULATION_FUEL_TYPE } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { InkPanel } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";
import { ArrowUpRight, BatteryCharging } from "lucide-react";
import Link from "next/link";

/**
 * Vehicular Emissions Scheme bands, as published by NEA.
 *
 * Static reference content: the bands and their rebates are policy rather than
 * anything the ingestion pipeline tracks, so they change only when the scheme
 * itself does.
 */
const VES_BANDS = [
  { band: "A1", note: "$25,000 rebate" },
  { band: "A2", note: "$15,000 rebate" },
  { band: "B", note: "Neutral band" },
];

/**
 * Closing panel of the right rail.
 *
 * The comp headlines this card with the size of the public charging network
 * (19,400 points, growing 31%, against a target of 60,000 by 2030). Nothing in
 * this repo can source that: LTA DataMall publishes an "Electric Vehicle
 * Charging Points" dataset, but it is not ingested, and the figure is not one
 * to invent. The panel keeps its shape and leads with the EV fleet from
 * `vehicle_population` instead — ingest that dataset to restore the original.
 */
export async function EvFleetPanel() {
  const [populationByFuelType, populationTotals] = await Promise.all([
    getVehiclePopulationByYearAndFuelType(),
    getVehiclePopulationYearlyTotals(),
  ]);

  const electricByYear = new Map<string, number>();
  for (const row of populationByFuelType) {
    if (row.fuelType !== ELECTRIC_POPULATION_FUEL_TYPE) {
      continue;
    }
    electricByYear.set(
      row.year,
      (electricByYear.get(row.year) ?? 0) + row.total,
    );
  }

  // `getVehiclePopulationYearlyTotals()` comes back newest year first.
  const [latest, previous] = populationTotals;
  const fleet = latest ? (electricByYear.get(latest.year) ?? 0) : 0;
  const previousFleet = previous ? (electricByYear.get(previous.year) ?? 0) : 0;

  if (!latest || fleet === 0) {
    return null;
  }

  const growth = previousFleet
    ? ((fleet - previousFleet) / previousFleet) * 100
    : 0;
  const fleetShare = latest.total ? (fleet / latest.total) * 100 : 0;

  return (
    <InkPanel>
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-on-dark/20 text-accent-on-dark">
          <BatteryCharging className="size-5" />
        </span>
        <Typography.Paragraph className="text-accent-foreground/85">
          EV fleet on the road
        </Typography.Paragraph>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <span className="font-extrabold text-5xl text-accent-on-dark tabular-nums tracking-tight">
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={fleet} />
        </span>
        {previousFleet > 0 ? <DeltaChip tone="on-dark" value={growth} /> : null}
      </div>

      <Typography.Paragraph
        color="muted"
        size="sm"
        className="text-accent-foreground/60"
      >
        battery-electric vehicles on Singapore roads · {fleetShare.toFixed(1)}%
        of the vehicle population in {latest.year}
      </Typography.Paragraph>

      <ul className="flex flex-col gap-3">
        {VES_BANDS.map((row, index) => (
          <li className="flex items-center gap-3" key={row.band}>
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full font-extrabold text-sm ${
                index === VES_BANDS.length - 1
                  ? "bg-accent-foreground/10 text-accent-foreground"
                  : "bg-accent-on-dark/20 text-accent-on-dark"
              }`}
            >
              {row.band}
            </span>
            <Typography.Paragraph
              color="muted"
              size="sm"
              className="text-accent-foreground/85"
            >
              {row.note}
            </Typography.Paragraph>
          </li>
        ))}
      </ul>

      <Typography.Paragraph
        color="muted"
        size="xs"
        className="text-accent-foreground/45"
      >
        Vehicular Emissions Scheme bands most EVs qualify for
      </Typography.Paragraph>

      <Link
        className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-bold text-accent-foreground text-sm transition-[filter] hover:brightness-110"
        href="/learn"
      >
        EV ownership guide
        <ArrowUpRight className="size-4" />
      </Link>
    </InkPanel>
  );
}
