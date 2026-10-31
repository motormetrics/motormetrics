import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { HeroCard } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/bento";
import { getPostalDistrict } from "@web/config/postal-districts";
import { getEvChargingLiveSummary } from "@web/queries/ev-charging";

const formatObservedAt = (iso: string) =>
  new Date(iso).toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });

/**
 * The compact form of `LiveStatus` that sits on the map with its controls:
 * free connectors now, and what the pin colours mean, since the legend under
 * the map is covered by the price content.
 */
export async function LiveChip({ district }: { district: string }) {
  const summary = await getEvChargingLiveSummary(district || undefined);
  if (summary.connectors === 0 || !summary.observedAt) {
    return null;
  }

  return (
    <div className="flex max-w-64 flex-col gap-1 rounded-2xl bg-overlay p-3 shadow-overlay">
      <span className="font-extrabold text-xl tabular-nums">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={summary.available}
        />{" "}
        free
      </span>
      {/* A phone's map is short and shares its top edge with the site
          search, so the chip keeps only the free count there. */}
      <Typography.Paragraph className="max-md:hidden" color="muted" size="xs">
        of{" "}
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={summary.connectors}
        />{" "}
        connectors · live {formatObservedAt(summary.observedAt)}
      </Typography.Paragraph>
      <Typography.Paragraph className="max-md:hidden" color="muted" size="xs">
        Green has free connectors · amber is full · grey is out of service
      </Typography.Paragraph>
    </div>
  );
}

/** Connector state at the latest cached batch, island-wide or per district. */
export async function LiveStatus({ district }: { district: string }) {
  const summary = await getEvChargingLiveSummary(district || undefined);
  const scope = getPostalDistrict(district)?.name ?? "Singapore";
  if (summary.connectors === 0 || !summary.observedAt) {
    return null;
  }

  const usable = summary.connectors - summary.unavailable;
  const inUsePercent = usable > 0 ? (summary.occupied / usable) * 100 : 0;

  return (
    <HeroCard>
      <span className="w-fit rounded-full bg-accent-foreground/20 px-4 py-2 font-bold text-sm">
        Live · {formatObservedAt(summary.observedAt)} SGT
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-extrabold text-6xl tabular-nums tracking-tight">
          {inUsePercent.toFixed(0)}%
        </span>
        <span className="rounded-full bg-accent-foreground/20 px-4 py-2 font-bold text-sm tabular-nums">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={summary.available}
          />{" "}
          free
        </span>
      </div>

      <Typography.Paragraph className="text-accent-foreground/85">
        of public connectors in {scope} in use right now
      </Typography.Paragraph>

      <Typography.Paragraph size="sm" className="text-accent-foreground/70">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={summary.connectors}
        />{" "}
        connectors across{" "}
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={summary.locations}
        />{" "}
        locations
        {summary.unavailable > 0 ? (
          <>
            {" · "}
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={summary.unavailable}
            />{" "}
            out of service
          </>
        ) : null}
      </Typography.Paragraph>
    </HeroCard>
  );
}
