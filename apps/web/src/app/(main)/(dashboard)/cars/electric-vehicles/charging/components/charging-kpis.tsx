import { KPI } from "@heroui-pro/react/kpi";
import { getChargingStats } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/price-stats";
import { UpdatedAgo } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/updated-ago";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { siteTitle } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/utils/describe-connectors";
import { getPostalDistrict } from "@web/config/postal-districts";
import {
  type EvChargingPricedLocation,
  getEvChargingLiveSummary,
  getEvChargingPriceRankings,
} from "@web/queries/ev-charging";
import type { SearchParams } from "nuqs/server";

/** Enough rows past any $0.00 listings to reach a published rate. */
const PUBLISHED_RATE_LOOKAHEAD = 20;

interface ChargingTile {
  note: string;
  title: string;
  value: number | null;
  /** Rates are dollars and cents per kWh; counts are whole connectors. */
  format: "rate" | "count";
}

/**
 * One tile, as `KpiTiles` draws them. The shared tiles round currency to
 * whole dollars, which would turn every per-kWh rate into $0 or $1, so the
 * charging page draws its own with cents.
 */
function ChargingKpi({ tile }: { tile: ChargingTile }) {
  return (
    <KPI className="h-full">
      <KPI.Header>
        <KPI.Title>{tile.title}</KPI.Title>
      </KPI.Header>
      <KPI.Content>
        {tile.value === null ? (
          <dd className="font-semibold text-2xl">–</dd>
        ) : (
          <KPI.Value
            currency={tile.format === "rate" ? "SGD" : undefined}
            locale="en-SG"
            maximumFractionDigits={tile.format === "rate" ? 2 : 0}
            minimumFractionDigits={tile.format === "rate" ? 2 : 0}
            style={tile.format === "rate" ? "currency" : "decimal"}
            value={tile.value}
          />
        )}
      </KPI.Content>
      <KPI.Footer className="text-muted text-xs tabular-nums">
        {tile.note}
      </KPI.Footer>
    </KPI>
  );
}

/** The cheapest site's name, or why there is none. */
const rateNote = (
  location: EvChargingPricedLocation | undefined,
  scope: string,
) => {
  if (!location) {
    return `No advertised rate in ${scope}`;
  }
  // LTA publishes $0.00 for free charging and for unlisted rates alike.
  return location.pricePerKwh === 0
    ? `${siteTitle(location)} · as published, check with the operator`
    : siteTitle(location);
};

/**
 * Free connectors now and the rates price searchers come for, for the
 * selected district: the cheapest DC and AC rates, and the island-wide
 * median.
 */
export async function ChargingKpis({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { district } = await loadSearchParams(searchParams);
  const scope = getPostalDistrict(district)?.name ?? "Singapore";
  const [summary, dcRates, acRates, { stats }] = await Promise.all([
    getEvChargingLiveSummary(district || undefined),
    getEvChargingPriceRankings({
      district: district || undefined,
      limit: PUBLISHED_RATE_LOOKAHEAD,
      order: "cheapest",
      powerRating: "DC",
    }),
    getEvChargingPriceRankings({
      district: district || undefined,
      limit: PUBLISHED_RATE_LOOKAHEAD,
      order: "cheapest",
      powerRating: "AC",
    }),
    getChargingStats(),
  ]);

  // A $0.00 rate is often one the operator has not published, so the
  // headline "cheapest" skips it; the rates table still lists it, footnoted.
  const cheapestDc = dcRates.find((rate) => rate.pricePerKwh > 0);
  const cheapestAc = acRates.find((rate) => rate.pricePerKwh > 0);

  const tiles: ChargingTile[] = [
    {
      format: "count",
      note: `of ${summary.connectors.toLocaleString("en-SG")} connectors in ${scope}`,
      title: "Free connectors",
      value: summary.connectors > 0 ? summary.available : null,
    },
    {
      format: "rate",
      note: rateNote(cheapestDc, scope),
      title: "Cheapest DC fast, per kWh",
      value: cheapestDc?.pricePerKwh ?? null,
    },
    {
      format: "rate",
      note: rateNote(cheapestAc, scope),
      title: "Cheapest AC, per kWh",
      value: cheapestAc?.pricePerKwh ?? null,
    },
    {
      format: "rate",
      note: `Singapore median across ${(stats?.locations ?? 0).toLocaleString("en-SG")} locations`,
      title: "Typical rate, per kWh",
      value: stats?.medianPerKwh ?? null,
    },
  ];

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <li key={tile.title}>
          <ChargingKpi tile={tile} />
        </li>
      ))}
    </ul>
  );
}

/**
 * "Updated 12 min ago · LTA DataMall, hourly". Reads only the cached
 * snapshot figures, so it is part of the static shell.
 */
export async function ChargingAsOf() {
  const { observedAt } = await getChargingStats();
  if (!observedAt) {
    return null;
  }

  return (
    <>
      <UpdatedAgo observedAt={observedAt} /> · LTA DataMall, refreshed hourly
    </>
  );
}
