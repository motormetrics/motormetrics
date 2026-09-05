import { Typography } from "@heroui/react";
import { MAP_ANCHOR_ID } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { SurfaceCard } from "@web/components/shared/bento";
import { getPostalDistrict } from "@web/config/postal-districts";
import { getEvChargingMapSites } from "@web/queries/ev-charging";
import { ChargingMapView } from "./charging-map-view";

/** Every public charging site on a map, coloured by live availability. */
export async function ChargingMap({ district }: { district: string }) {
  const sites = await getEvChargingMapSites();
  if (sites.length === 0) {
    return null;
  }
  const scope = getPostalDistrict(district)?.name ?? "Singapore";

  return (
    <div className="scroll-mt-6" id={MAP_ANCHOR_ID}>
      <SurfaceCard className="gap-4 p-7">
        <div className="flex flex-col gap-1">
          <Typography.Paragraph className="text-muted">
            Live availability by site
          </Typography.Paragraph>
          <Typography.Heading level={3}>Chargers in {scope}</Typography.Heading>
        </div>

        <ChargingMapView district={district} sites={sites} />
      </SurfaceCard>
    </div>
  );
}
