"use client";

import { Typography } from "@heroui/react";
import {
  MAP_ANCHOR_ID,
  siteParam,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { districtForPostalCode } from "@web/config/postal-districts";
import type { EvChargingLocation } from "@web/queries/ev-charging";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";

/** "2× DC 120 kW" style summary of what a location offers. */
export const describeConnectors = (location: EvChargingLocation): string => {
  const rating = location.dcConnectors > 0 ? "DC" : "AC";
  const speed = location.maxSpeedKw != null ? ` ${location.maxSpeedKw} kW` : "";
  return `${location.connectors}× ${rating}${speed}`;
};

/**
 * A location line item shared by the ranked lists on the charging page.
 *
 * Clicking a row selects the site in the URL, which the map picks up to fly
 * there and open its popup.
 */
export function LocationRow({
  index,
  location,
  trailing,
}: {
  index: number;
  location: EvChargingLocation;
  /** Right-aligned figure: a price, a percentage, or a date. */
  trailing: ReactNode;
}) {
  const [, setSite] = useQueryState("site", siteParam);
  const district = districtForPostalCode(location.postalCode);
  const title = location.stationName ?? location.address ?? location.locationId;

  return (
    <li>
      <button
        className="flex w-full cursor-pointer items-center gap-3 rounded-xl text-left transition-colors hover:bg-default/60"
        onClick={() => {
          setSite(location.locationId);
          document
            .getElementById(MAP_ANCHOR_ID)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
        type="button"
      >
        <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-accent/15 font-extrabold text-accent-strong text-xs tabular-nums">
          {index + 1}
        </span>
        <div className="flex min-w-0 flex-col">
          <Typography.Paragraph
            size="sm"
            className="truncate font-semibold text-foreground/85"
          >
            {title}
          </Typography.Paragraph>
          <Typography.Paragraph color="muted" size="xs" className="truncate">
            {[district?.name, describeConnectors(location)]
              .filter(Boolean)
              .join(" · ")}
          </Typography.Paragraph>
        </div>
        <span className="ml-auto shrink-0 font-extrabold text-sm tabular-nums">
          {trailing}
        </span>
      </button>
    </li>
  );
}
