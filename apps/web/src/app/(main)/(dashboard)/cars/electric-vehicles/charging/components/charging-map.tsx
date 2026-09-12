import { MAP_ANCHOR_ID } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { SurfaceCard } from "@web/components/shared/bento";
import { getEvChargingMapSites } from "@web/queries/ev-charging";
import { ChargingMapView } from "./charging-map-view";

/**
 * Every public charging site on a map, coloured by live availability.
 *
 * Reads no search params: the district filter is applied on the client, so
 * this card prerenders into the static shell and costs nothing per request.
 *
 * The site list is deliberately not passed down. `ChargingMapView` fetches it
 * from `/api/ev-charging/map-sites`, which keeps 2,755 sites out of the RSC
 * payload of every visit — the page serves both a prerender stream and a
 * resume stream, so anything in the tree is paid for twice. The cached query
 * is still awaited here, but only to decide whether the card has anything to
 * show; the array itself never crosses the server/client boundary.
 */
export async function ChargingMap() {
  const sites = await getEvChargingMapSites();
  if (sites.length === 0) {
    return null;
  }

  return (
    <div className="scroll-mt-6" id={MAP_ANCHOR_ID}>
      <SurfaceCard className="gap-4 p-7">
        <ChargingMapView />
      </SurfaceCard>
    </div>
  );
}
