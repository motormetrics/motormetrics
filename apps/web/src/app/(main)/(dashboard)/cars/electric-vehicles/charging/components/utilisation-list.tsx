import { Typography } from "@heroui/react";
import { SurfaceCard } from "@web/components/shared/bento";
import { getPostalDistrict } from "@web/config/postal-districts";
import {
  getEvChargingLocationUtilisation,
  type UtilisationOrder,
} from "@web/queries/ev-charging";
import { LocationRow } from "./location-row";

/** Locations with the highest or lowest average occupancy this week. */
export async function UtilisationList({
  district,
  order,
}: {
  district: string;
  order: UtilisationOrder;
}) {
  const locations = await getEvChargingLocationUtilisation({
    order,
    district: district || undefined,
  });
  const scope = getPostalDistrict(district)?.name ?? "Singapore";

  return (
    <SurfaceCard className="gap-4 p-7">
      <div className="flex flex-col gap-1">
        <Typography.Paragraph className="text-muted">
          {order === "busiest" ? "Highest" : "Lowest"} average use
        </Typography.Paragraph>
        <Typography.Heading level={3}>
          {order === "busiest" ? "Busiest" : "Quietest"} locations
        </Typography.Heading>
      </div>

      {locations.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          Not enough usage history for {scope} yet. Check back after a day of
          readings.
        </Typography.Paragraph>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {locations.map((location, index) => (
            <LocationRow
              index={index}
              key={location.locationId}
              location={location}
              trailing={`${location.utilisationPercent.toFixed(0)}%`}
            />
          ))}
        </ul>
      )}

      <Typography.Paragraph color="muted" size="xs">
        Share of connectors in use · past 7 days · {scope}
      </Typography.Paragraph>
    </SurfaceCard>
  );
}
