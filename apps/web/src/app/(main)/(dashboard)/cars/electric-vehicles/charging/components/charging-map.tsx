// import { Card } from "@heroui/react";
import { Skeleton } from "@heroui/react";
import { ChargingMapView } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-map-view";
import { LiveChip } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/live-status";
import {
  loadSearchParams,
  MAP_ANCHOR_ID,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

/**
 * Every public charging site on a map, coloured by live availability, run
 * edge to edge across the page with the price content overlapping its lower
 * half.
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
 *
 * The live availability chip streams in its own boundary and is handed to the
 * view to sit with the map controls.
 */
export function ChargingMap({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return (
    // Bleeds to the edge of MainLayout's column by cancelling its padding
    // (`px-4 sm:px-6 lg:px-9`). Remove these margins when the site moves to
    // the planned full-width layout.
    <div className="-mx-4 scroll-mt-6 sm:-mx-6 lg:-mx-9" id={MAP_ANCHOR_ID}>
      {/* <Card className="gap-4 rounded-4xl p-7"> */}
      <ChargingMapView
        liveStatus={
          <Suspense fallback={<Skeleton className="h-16 w-56 rounded-2xl" />}>
            <MapLiveChip searchParams={searchParams} />
          </Suspense>
        }
      />
      {/* </Card> */}
    </div>
  );
}

async function MapLiveChip({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { district } = await loadSearchParams(searchParams);
  return <LiveChip district={district} />;
}
