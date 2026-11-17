import { ChargingMapView } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-map-view";
import { MAP_ANCHOR_ID } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { FigureCard } from "@web/components/shared/figure-card";

/**
 * Every public charging site on a map, coloured by availability at the
 * latest hourly snapshot.
 *
 * It awaits nothing on the server, so the card is part of the static shell.
 * `ChargingMapView` reads the district and selected site from the URL with
 * nuqs and fetches the site list on the client from
 * `/api/ev-charging/map-sites`, which keeps 2,755 sites out of the RSC
 * payload. The page wraps it in Suspense for the nuqs hooks.
 */
export function ChargingMap() {
  return (
    <div className="scroll-mt-6" id={MAP_ANCHOR_ID}>
      <FigureCard
        description="Green has free connectors · amber is full · grey is out of service"
        title="Chargers by availability"
      >
        <ChargingMapView />
      </FigureCard>
    </div>
  );
}
