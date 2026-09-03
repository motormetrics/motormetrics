import { Typography } from "@heroui/react";
import { QueryTabs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/query-tabs";
import { SurfaceCard } from "@web/components/shared/bento";
import { getPostalDistrict } from "@web/config/postal-districts";
import {
  getEvChargingPriceRankings,
  type PowerRating,
  type PriceOrder,
} from "@web/queries/ev-charging";
import { LocationRow } from "./location-row";

const POWER_OPTIONS = [
  { key: "AC" as const, label: "AC" },
  { key: "DC" as const, label: "DC" },
];

/** Cheapest or priciest advertised per-kWh rates for one power rating. */
export async function PriceList({
  district,
  order,
  power,
}: {
  district: string;
  order: PriceOrder;
  power: PowerRating;
}) {
  const locations = await getEvChargingPriceRankings({
    powerRating: power,
    order,
    district: district || undefined,
  });
  const scope = getPostalDistrict(district)?.name ?? "Singapore";

  return (
    <SurfaceCard className="gap-4 p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Typography.Paragraph className="text-muted">
            {order === "cheapest" ? "Lowest" : "Highest"} advertised price
          </Typography.Paragraph>
          <Typography.Heading level={3}>
            {order === "cheapest" ? "Cheapest" : "Most expensive"} {power}{" "}
            charging
          </Typography.Heading>
        </div>
        <QueryTabs
          ariaLabel="Power rating"
          options={POWER_OPTIONS}
          param="power"
          value={power}
          variant="segmented"
        />
      </div>

      {locations.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          No {power} chargers with a per-kWh price in {scope} yet.
        </Typography.Paragraph>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {locations.map((location, index) => (
            <LocationRow
              index={index}
              key={location.locationId}
              location={location}
              trailing={`$${location.pricePerKwh.toFixed(2)}/kWh`}
            />
          ))}
        </ul>
      )}

      <Typography.Paragraph color="muted" size="xs">
        Per-kWh rates from LTA DataMall · {scope}
      </Typography.Paragraph>
    </SurfaceCard>
  );
}
