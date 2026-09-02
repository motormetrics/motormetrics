import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { deriveChargingNetworkGrowth } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/charging-network";
import { ELECTRIC_POPULATION_FUEL_TYPE } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { InkPanel } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import {
  getEvChargingNetworkSummary,
  getEvChargingRegistrationsByMonth,
} from "@web/queries/ev-charging";
import {
  getVehiclePopulationByYearAndFuelType,
  getVehiclePopulationYearlyTotals,
} from "@web/queries/vehicle-population";
import { ArrowUpRight, BatteryCharging, PlugZap } from "lucide-react";
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
 * Headlines the size of the public charging network, sourced from LTA
 * DataMall's quarterly charging point registry, with the battery-electric
 * fleet from `vehicle_population` as the supporting line. Until that registry
 * has been ingested the fleet figure takes the headline instead, so the panel
 * never shows an invented number.
 */
export async function EvFleetPanel() {
  const [network, monthly, populationByFuelType, populationTotals] =
    await Promise.all([
      getEvChargingNetworkSummary(),
      getEvChargingRegistrationsByMonth(),
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
  const fleetGrowth = previousFleet
    ? ((fleet - previousFleet) / previousFleet) * 100
    : 0;
  const fleetShare = latest?.total ? (fleet / latest.total) * 100 : 0;

  const hasNetwork = network.connectors > 0;
  const hasFleet = Boolean(latest) && fleet > 0;

  if (!hasNetwork && !hasFleet) {
    return null;
  }

  const growth = hasNetwork ? deriveChargingNetworkGrowth(monthly) : null;
  const Icon = hasNetwork ? PlugZap : BatteryCharging;

  return (
    <InkPanel>
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-on-dark/20 text-accent-on-dark">
          <Icon className="size-5" />
        </span>
        <Typography.Paragraph className="text-accent-foreground/85">
          {hasNetwork ? "Public charging network" : "EV fleet on the road"}
        </Typography.Paragraph>
      </div>

      {hasNetwork ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-extrabold text-5xl text-accent-on-dark tabular-nums tracking-tight">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={network.connectors}
              />
            </span>
            {growth?.growthPercent != null ? (
              <DeltaChip tone="on-dark" value={growth.growthPercent} />
            ) : null}
          </div>

          <Typography.Paragraph
            color="muted"
            size="sm"
            className="text-accent-foreground/60"
          >
            public charging points across{" "}
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={network.sites}
            />{" "}
            locations
            {growth
              ? ` · registered with LTA as of ${formatDateToMonthYear(growth.asOf)}`
              : null}
          </Typography.Paragraph>

          {hasFleet ? (
            <Typography.Paragraph
              color="muted"
              size="sm"
              className="text-accent-foreground/60"
            >
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={fleet}
              />{" "}
              battery-electric vehicles on the road · {fleetShare.toFixed(1)}%
              of the vehicle population in {latest?.year}
            </Typography.Paragraph>
          ) : null}
        </>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-extrabold text-5xl text-accent-on-dark tabular-nums tracking-tight">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={fleet}
              />
            </span>
            {previousFleet > 0 ? (
              <DeltaChip tone="on-dark" value={fleetGrowth} />
            ) : null}
          </div>

          <Typography.Paragraph
            color="muted"
            size="sm"
            className="text-accent-foreground/60"
          >
            battery-electric vehicles on Singapore roads ·{" "}
            {fleetShare.toFixed(1)}% of the vehicle population in {latest?.year}
          </Typography.Paragraph>
        </>
      )}

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
