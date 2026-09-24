import { ChargingMapView } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-map-view";
import { MAP_ANCHOR_ID } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { SurfaceCard } from "@web/components/shared/bento";

/**
 * Every public charging site on a map, coloured by live availability.
 *
 * It awaits nothing on the server. `ChargingMapView` reads the district and
 * selected site from the URL with nuqs, so this boundary renders at request
 * time rather than in the static shell; awaiting the site list here made the
 * whole card wait for the snapshot behind it, which on a cold instance is a
 * ~5 MB download before a single pixel of the card could stream.
 *
 * The site list is fetched on the client from `/api/ev-charging/map-sites`,
 * which also keeps 2,755 sites out of the RSC payload. An empty or failed
 * fetch is handled in the view, which shows a message in the map area.
 */
export function ChargingMap() {
  return (
    <div className="scroll-mt-6" id={MAP_ANCHOR_ID}>
      <SurfaceCard className="gap-4 p-7">
        <ChargingMapView />
      </SurfaceCard>
    </div>
  );
}
