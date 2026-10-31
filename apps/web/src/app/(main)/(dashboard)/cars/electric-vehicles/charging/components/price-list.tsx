import { Card, Skeleton, Typography } from "@heroui/react";
import { LocationRow } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/location-row";
import { ZERO_RATE_DISCLAIMER } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-stats";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { QueryTabs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/query-tabs";
import { getPostalDistrict } from "@web/config/postal-districts";
import { getEvChargingPriceRankings } from "@web/queries/ev-charging";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

const POWER_OPTIONS = [
  { key: "AC" as const, label: "AC" },
  { key: "DC" as const, label: "DC fast" },
];

const ORDER_OPTIONS = [
  { key: "cheapest" as const, label: "Cheapest" },
  { key: "priciest" as const, label: "Most expensive" },
];

interface PriceListProps {
  searchParams: Promise<SearchParams>;
}

/**
 * One ranked list of advertised per-kWh rates. Power rating and sort order
 * are both URL params, set by the two switches beside the heading, so a
 * change re-renders the list on the server.
 *
 * It replaces the separate cheapest and most-expensive cards, whose toggles
 * wrote the same `power` param and so changed each other out of sight.
 *
 * The card prerenders into the static shell; the heading, switches and rows
 * read the URL, so each streams in behind its own boundary.
 */
export function PriceList({ searchParams }: PriceListProps) {
  return (
    <Card className="gap-4 rounded-4xl p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Suspense fallback={<Skeleton className="h-8 w-72" />}>
          <PriceHeading searchParams={searchParams} />
        </Suspense>
        <Suspense fallback={<Skeleton className="h-11 w-80" />}>
          <PriceSwitches searchParams={searchParams} />
        </Suspense>
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
        <PriceRows searchParams={searchParams} />
      </Suspense>
    </Card>
  );
}

async function PriceHeading({ searchParams }: PriceListProps) {
  const { district, order, power } = await loadSearchParams(searchParams);
  const scope = getPostalDistrict(district)?.name ?? "Singapore";
  const rank = order === "cheapest" ? "Cheapest" : "Most expensive";
  const rating = power === "DC" ? "DC fast" : "AC";

  return (
    <Typography.Heading level={2}>
      {`${rank} ${rating} chargers in ${scope}`}
    </Typography.Heading>
  );
}

async function PriceSwitches({ searchParams }: PriceListProps) {
  const { order, power } = await loadSearchParams(searchParams);
  return (
    <div className="flex flex-wrap gap-2">
      <QueryTabs
        ariaLabel="Charger type"
        options={POWER_OPTIONS}
        param="power"
        value={power}
        variant="segmented"
      />
      <QueryTabs
        ariaLabel="Sort by price"
        options={ORDER_OPTIONS}
        param="order"
        value={order}
        variant="segmented"
      />
    </div>
  );
}

async function PriceRows({ searchParams }: PriceListProps) {
  const { district, order, power } = await loadSearchParams(searchParams);
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
        <ol className="flex flex-col gap-3.5">
          {locations.map((location, index) => (
            <LocationRow
              index={index}
              key={location.locationId}
              location={location}
              trailing={`$${location.pricePerKwh.toFixed(2)}/kWh`}
            />
          ))}
        </ol>
      )}

      <Typography.Paragraph color="muted" size="xs">
        Per-kWh rates from LTA DataMall · {scope}
      </Typography.Paragraph>
      {locations.some((location) => location.pricePerKwh === 0) ? (
        <Typography.Paragraph color="muted" size="xs">
          {ZERO_RATE_DISCLAIMER}
        </Typography.Paragraph>
      ) : null}
    </>
  );
}
