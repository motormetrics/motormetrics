import { Card, Skeleton, Typography } from "@heroui/react";
import {
  deriveChargingStats,
  ZERO_RATE_DISCLAIMER,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-stats";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { siteTitle } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/utils/describe-connectors";
import { getPostalDistrict } from "@web/config/postal-districts";
import {
  type EvChargingPricedLocation,
  getEvChargingPriceRankings,
  getEvChargingSnapshot,
} from "@web/queries/ev-charging";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

interface PriceSummaryProps {
  searchParams: Promise<SearchParams>;
}

function PriceTile({
  label,
  price,
  caption,
}: {
  label: string;
  price: number | null;
  caption: string;
}) {
  return (
    <Card className="gap-1 rounded-3xl p-6">
      <Typography.Paragraph color="muted" size="sm" weight="semibold">
        {label}
      </Typography.Paragraph>
      <span className="font-extrabold text-4xl tabular-nums tracking-tight">
        {price == null ? "–" : `$${price.toFixed(2)}`}
        <span className="font-semibold text-base text-muted">/kWh</span>
      </span>
      <Typography.Paragraph color="muted" size="sm" className="truncate">
        {caption}
      </Typography.Paragraph>
      {/* Inside the tile, not under the row: below the tiles is the map. */}
      {price === 0 ? (
        <Typography.Paragraph color="muted" size="xs">
          {ZERO_RATE_DISCLAIMER}
        </Typography.Paragraph>
      ) : null}
    </Card>
  );
}

function TileSkeleton() {
  return (
    <Card className="gap-3 rounded-3xl p-6">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="h-10 w-32" />
      <Skeleton className="h-4 w-36" />
    </Card>
  );
}

const cheapestCaption = (
  location: EvChargingPricedLocation | undefined,
  scope: string,
) => (location ? siteTitle(location) : `No advertised rate in ${scope}`);

/**
 * The three figures price searchers come for, ahead of everything else: the
 * cheapest DC and AC rates in the selected district, and the island-wide
 * median. They replace the intro sentence that used to carry them mid-prose.
 */
export function PriceSummary({ searchParams }: PriceSummaryProps) {
  return (
    <section
      aria-label="Price summary"
      className="grid grid-cols-1 gap-4 md:grid-cols-3"
    >
      <Suspense
        fallback={
          <>
            <TileSkeleton />
            <TileSkeleton />
            <TileSkeleton />
          </>
        }
      >
        <PriceTiles searchParams={searchParams} />
      </Suspense>
    </section>
  );
}

async function PriceTiles({ searchParams }: PriceSummaryProps) {
  const { district } = await loadSearchParams(searchParams);
  const scope = getPostalDistrict(district)?.name ?? "Singapore";
  const [[cheapestDc], [cheapestAc], { records }] = await Promise.all([
    getEvChargingPriceRankings({
      powerRating: "DC",
      order: "cheapest",
      district: district || undefined,
      limit: 1,
    }),
    getEvChargingPriceRankings({
      powerRating: "AC",
      order: "cheapest",
      district: district || undefined,
      limit: 1,
    }),
    getEvChargingSnapshot(),
  ]);
  const stats = deriveChargingStats(records);

  return (
    <>
      <PriceTile
        caption={cheapestCaption(cheapestDc, scope)}
        label={`Cheapest DC fast charging · ${scope}`}
        price={cheapestDc?.pricePerKwh ?? null}
      />
      <PriceTile
        caption={cheapestCaption(cheapestAc, scope)}
        label={`Cheapest AC charging · ${scope}`}
        price={cheapestAc?.pricePerKwh ?? null}
      />
      <PriceTile
        caption={`Singapore median across ${stats.locations.toLocaleString("en-SG")} locations`}
        label="Typical rate"
        price={stats.medianPerKwh}
      />
      {/* Moved into each $0.00 tile: under the tiles this sat on the map.
      {cheapestDc?.pricePerKwh === 0 || cheapestAc?.pricePerKwh === 0 ? (
        <Typography.Paragraph className="md:col-span-3" color="muted" size="xs">
          {ZERO_RATE_DISCLAIMER}
        </Typography.Paragraph>
      ) : null}
      */}
    </>
  );
}
