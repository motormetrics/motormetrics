import { Skeleton, Typography } from "@heroui/react";
import { LocationRow } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/location-row";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { SurfaceCard } from "@web/components/shared/bento";
import { getPostalDistrict } from "@web/config/postal-districts";
import {
  getEvChargingLocationUtilisation,
  type UtilisationOrder,
} from "@web/queries/ev-charging";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface UtilisationListProps {
  order: UtilisationOrder;
  searchParams: Promise<SearchParams>;
}

/**
 * Locations with the highest or lowest average occupancy this week.
 *
 * The card and its header depend only on `order`, so they prerender into the
 * static shell. Only the rows read the district from the URL, so they stream
 * in behind their own boundary.
 */
export function UtilisationList({ order, searchParams }: UtilisationListProps) {
  return (
    <SurfaceCard className="gap-4 p-7">
      <div className="flex flex-col gap-1">
        <Typography.Paragraph color="muted">
          {order === "busiest" ? "Highest" : "Lowest"} average use
        </Typography.Paragraph>
        <Typography.Heading level={3}>
          {order === "busiest" ? "Busiest" : "Quietest"} locations
        </Typography.Heading>
      </div>

      <Suspense
        fallback={
          <div className="flex flex-col gap-4">
            {Array.from({ length: 10 }, (_, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static placeholders
              <Skeleton key={index} className="h-10 w-full" />
            ))}
          </div>
        }
      >
        <UtilisationRows order={order} searchParams={searchParams} />
      </Suspense>
    </SurfaceCard>
  );
}

async function UtilisationRows({ order, searchParams }: UtilisationListProps) {
  const { district } = await loadSearchParams(searchParams);
  const locations = await getEvChargingLocationUtilisation({
    order,
    district: district || undefined,
  });
  const scope = getPostalDistrict(district)?.name ?? "Singapore";

  return (
    <>
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
    </>
  );
}
