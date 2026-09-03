import { Typography } from "@heroui/react";
import { InkPanel } from "@web/components/shared/bento";
import { districtForPostalCode } from "@web/config/postal-districts";
import { getEvChargingRecentChanges } from "@web/queries/ev-charging";
import { Sparkles } from "lucide-react";
import { describeConnectors } from "./location-row";

const LIMIT = 5;

const formatDay = (iso: string) =>
  new Date(iso).toLocaleDateString("en-SG", {
    timeZone: "Asia/Singapore",
    weekday: "short",
    day: "numeric",
    month: "short",
  });

/** New locations and price moves spotted in the past week. */
export async function RecentChanges() {
  const { newLocations, priceChanges } = await getEvChargingRecentChanges();

  return (
    <InkPanel>
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-on-dark/20 text-accent-on-dark">
          <Sparkles className="size-5" />
        </span>
        <Typography.Paragraph className="text-accent-foreground/85">
          This week
        </Typography.Paragraph>
      </div>

      <Typography.Paragraph
        size="sm"
        className="font-bold text-accent-foreground"
      >
        New chargers
      </Typography.Paragraph>
      {newLocations.length === 0 ? (
        <Typography.Paragraph size="sm" className="text-accent-foreground/60">
          No new chargers spotted this week.
        </Typography.Paragraph>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {newLocations.slice(0, LIMIT).map((location) => (
            <li className="flex flex-col" key={location.locationId}>
              <span className="truncate font-bold text-accent-foreground text-sm">
                {location.stationName ??
                  location.address ??
                  location.locationId}
              </span>
              <span className="text-accent-foreground/60 text-xs">
                {[
                  describeConnectors(location),
                  districtForPostalCode(location.postalCode)?.name,
                  `Spotted ${formatDay(location.spottedAt)}`,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      )}

      <Typography.Paragraph
        size="sm"
        className="mt-2 font-bold text-accent-foreground"
      >
        Price changes
      </Typography.Paragraph>
      {priceChanges.length === 0 ? (
        <Typography.Paragraph size="sm" className="text-accent-foreground/60">
          No price changes spotted this week.
        </Typography.Paragraph>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {priceChanges.slice(0, LIMIT).map((change) => (
            <li
              className="flex flex-col"
              key={`${change.locationId}-${change.previousValue}-${change.value}`}
            >
              <span className="truncate font-bold text-accent-foreground text-sm">
                {change.stationName ?? change.address ?? change.locationId}
              </span>
              <span className="text-accent-foreground/60 text-xs tabular-nums">
                {change.previousValue ?? "—"} → {change.value} ·{" "}
                {formatDay(change.observedAt)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </InkPanel>
  );
}
