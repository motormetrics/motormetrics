import { Skeleton, Typography } from "@heroui/react";
import { LocationRow } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/location-row";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { QueryTabs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/query-tabs";
import { SurfaceCard } from "@web/components/shared/bento";
import { ListSkeleton } from "@web/components/shared/skeleton";
import { getPostalDistrict } from "@web/config/postal-districts";
import {
  getEvChargingPriceRankings,
  type PriceOrder,
} from "@web/queries/ev-charging";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

const POWER_OPTIONS = [
  { key: "AC" as const, label: "AC" },
  { key: "DC" as const, label: "DC" },
];

interface PriceListProps {
  order: PriceOrder;
  searchParams: Promise<SearchParams>;
}

/**
 * Cheapest or priciest advertised per-kWh rates for one power rating.
 *
 * The card and header prerender into the static shell; the heading leaves the
 * power rating to the toggle beside it. The toggle and the rows read the URL,
 * so each streams in behind its own boundary.
 */
export function PriceList({ order, searchParams }: PriceListProps) {
  return (
    <SurfaceCard className="gap-4 p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <Typography.Paragraph className="text-muted">
            {order === "cheapest" ? "Lowest" : "Highest"} advertised price
          </Typography.Paragraph>
          <Typography.Heading level={3}>
            {order === "cheapest" ? "Cheapest" : "Most expensive"} charging
          </Typography.Heading>
        </div>
        <Suspense fallback={<Skeleton className="h-11 w-28 rounded-full" />}>
          <PowerToggle searchParams={searchParams} />
        </Suspense>
      </div>

      <Suspense fallback={<ListSkeleton count={10} itemHeight="h-10" />}>
        <PriceRows order={order} searchParams={searchParams} />
      </Suspense>
    </SurfaceCard>
  );
}

async function PowerToggle({
  searchParams,
}: Pick<PriceListProps, "searchParams">) {
  const { power } = await loadSearchParams(searchParams);
  return (
    <QueryTabs
      ariaLabel="Power rating"
      options={POWER_OPTIONS}
      param="power"
      value={power}
      variant="segmented"
    />
  );
}

async function PriceRows({ order, searchParams }: PriceListProps) {
  const { district, power } = await loadSearchParams(searchParams);
  const locations = await getEvChargingPriceRankings({
    powerRating: power,
    order,
    district: district || undefined,
  });
  const scope = getPostalDistrict(district)?.name ?? "Singapore";

  return (
    <>
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
    </>
  );
}
