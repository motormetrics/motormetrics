import { Chip, ProgressBar, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { Headline, SectionHead } from "@web/components/shared/overview";
import { districtForPostalCode } from "@web/config/postal-districts";
import {
  type EvChargingPricedLocation,
  getEvChargingLiveSummary,
  getEvChargingNetworkSummary,
  getEvChargingPriceRankings,
} from "@web/queries/ev-charging";

const LINK = {
  href: "/cars/electric-vehicles/charging",
  label: "All charging data",
};

/**
 * Where a rate is charged: the operator and district when one location has
 * it, otherwise how many share it.
 */
function describeRate(locations: EvChargingPricedLocation[]): string | null {
  const leader = locations[0];
  if (!leader) {
    return null;
  }

  const atRate = locations.filter(
    (location) => location.pricePerKwh === leader.pricePerKwh,
  );
  if (atRate.length > 1) {
    return `${atRate.length} locations at this rate`;
  }

  return [leader.operator, districtForPostalCode(leader.postalCode)?.name]
    .filter(Boolean)
    .join(" · ");
}

function RateStat({
  label,
  locations,
}: {
  label: string;
  locations: EvChargingPricedLocation[];
}) {
  const price = locations[0]?.pricePerKwh;
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <Typography.Paragraph className="font-semibold" color="muted" size="sm">
        {label}
      </Typography.Paragraph>
      <span className="font-extrabold text-[26px] tabular-nums tracking-tight">
        {price == null ? "—" : `$${price.toFixed(2)}`}
        <span className="font-semibold text-[15px] text-muted">/kWh</span>
      </span>
      <Typography.Paragraph
        className="font-medium"
        color="muted"
        size="sm"
        truncate
      >
        {describeRate(locations) ?? "not advertised"}
      </Typography.Paragraph>
    </div>
  );
}

/**
 * Public connector state from LTA DataMall's live feed. Everything derives
 * from one cached snapshot; without a feed key it falls back to the registered
 * network counts and says so rather than showing a stale percentage.
 */
export async function EvCharging() {
  const [live, cheapest, priciest, network] = await Promise.all([
    getEvChargingLiveSummary(),
    getEvChargingPriceRankings({
      limit: Number.MAX_SAFE_INTEGER,
      order: "cheapest",
      powerRating: "DC",
    }),
    getEvChargingPriceRankings({
      limit: Number.MAX_SAFE_INTEGER,
      order: "priciest",
      powerRating: "DC",
    }),
    getEvChargingNetworkSummary(),
  ]);

  const isLive = live.connectors > 0 && live.observedAt !== null;
  const usable = live.connectors - live.unavailable;
  const inUsePercent = usable > 0 ? (live.occupied / usable) * 100 : 0;

  if (!isLive && network.connectors === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-6">
      <SectionHead
        caption={
          isLive
            ? "Public connectors in Singapore · live"
            : "Public connectors in Singapore"
        }
        eyebrow="Electric vehicles"
        link={LINK}
        title="EV charging"
      />
      <div className="flex flex-col gap-3">
        {isLive ? (
          <>
            <Headline
              caption="of public connectors in use right now"
              delta={
                <Chip
                  className="gap-2 rounded-full px-3.5 py-2 font-bold text-sm"
                  color="success"
                  variant="soft"
                >
                  <span
                    aria-hidden
                    className="size-2 rounded-full bg-success"
                  />
                  <Chip.Label className="px-0">Live</Chip.Label>
                </Chip>
              }
              size="md"
              value={`${inUsePercent.toFixed(1)}%`}
            />
            {/* Decorative: the figure above already states the share. */}
            <ProgressBar
              aria-hidden
              className="w-full"
              value={Math.min(inUsePercent, 100)}
            >
              <ProgressBar.Track className="h-3 rounded-full bg-surface-secondary">
                <ProgressBar.Fill className="rounded-full bg-accent" />
              </ProgressBar.Track>
            </ProgressBar>
            <Typography.Paragraph
              className="font-medium"
              color="muted"
              size="sm"
            >
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={live.connectors}
              />{" "}
              connectors across{" "}
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={live.locations}
              />{" "}
              locations
              {live.unavailable > 0 ? (
                <>
                  {" · "}
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={live.unavailable}
                  />{" "}
                  out of service
                </>
              ) : null}
            </Typography.Paragraph>
          </>
        ) : (
          <Typography.Paragraph className="font-medium" color="muted">
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={network.connectors}
            />{" "}
            connectors across{" "}
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={network.sites}
            />{" "}
            locations · live availability is not available right now
          </Typography.Paragraph>
        )}

        {cheapest.length > 0 ? (
          <div className="grid grid-cols-2 gap-6 border-separator border-t pt-4">
            <RateStat label="Cheapest DC rate" locations={cheapest} />
            <RateStat label="Most expensive DC rate" locations={priciest} />
          </div>
        ) : null}

        <Typography.Paragraph className="font-medium" color="muted" size="sm">
          Per-kWh rates from LTA DataMall
        </Typography.Paragraph>
      </div>
    </section>
  );
}
