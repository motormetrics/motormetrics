import { Skeleton, Typography } from "@heroui/react";
import { ZERO_RATE_DISCLAIMER } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-stats";
import { PriceTable } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-table";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import {
  describeConnectors,
  siteTitle,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/utils/describe-connectors";
import { QueryTabs } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/query-tabs";
import { FigureCard } from "@web/components/shared/figure-card";
import {
  districtForPostalCode,
  getPostalDistrict,
} from "@web/config/postal-districts";
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
 * One ranked table of advertised per-kWh rates. Power rating and sort order
 * are URL params, set by the two switches in the card head, so a change
 * re-renders the table on the server. The card is in the static shell; the
 * parts that read the URL stream behind their own boundaries.
 */
export function PriceList({ searchParams }: PriceListProps) {
  return (
    <FigureCard
      description={
        <Suspense fallback=" ">
          <PriceScope searchParams={searchParams} />
        </Suspense>
      }
      title="Charging rates"
      trailing={
        <Suspense fallback={<Skeleton className="h-10 w-72" />}>
          <PriceSwitches searchParams={searchParams} />
        </Suspense>
      }
    >
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <PriceRows searchParams={searchParams} />
      </Suspense>
    </FigureCard>
  );
}

/** "Cheapest DC fast chargers in Tampines, per kWh". */
async function PriceScope({ searchParams }: PriceListProps) {
  const { district, order, power } = await loadSearchParams(searchParams);
  const scope = getPostalDistrict(district)?.name ?? "Singapore";
  const rank = order === "cheapest" ? "Cheapest" : "Most expensive";
  const rating = power === "DC" ? "DC fast" : "AC";

  return `${rank} ${rating} chargers in ${scope}, per kWh`;
}

async function PriceSwitches({ searchParams }: PriceListProps) {
  const { order, power } = await loadSearchParams(searchParams);

  return (
    <>
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
    </>
  );
}

async function PriceRows({ searchParams }: PriceListProps) {
  const { district, order, power } = await loadSearchParams(searchParams);
  const locations = await getEvChargingPriceRankings({
    district: district || undefined,
    order,
    powerRating: power,
  });
  const scope = getPostalDistrict(district)?.name ?? "Singapore";

  return (
    <>
      <PriceTable
        label={`${order === "cheapest" ? "Cheapest" : "Most expensive"} ${power} chargers in ${scope}`}
        rows={locations.map((location, index) => ({
          detail: [
            districtForPostalCode(location.postalCode)?.name,
            describeConnectors(location),
          ]
            .filter(Boolean)
            .join(" · "),
          locationId: location.locationId,
          pricePerKwh: location.pricePerKwh,
          rank: index + 1,
          title: siteTitle(location),
        }))}
      />
      {locations.some((location) => location.pricePerKwh === 0) ? (
        <Typography.Paragraph color="muted" size="xs">
          {ZERO_RATE_DISCLAIMER}
        </Typography.Paragraph>
      ) : null}
    </>
  );
}
