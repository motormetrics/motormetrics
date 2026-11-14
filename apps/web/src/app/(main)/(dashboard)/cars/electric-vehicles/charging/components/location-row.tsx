"use client";

import { Typography } from "@heroui/react";
import {
  MAP_ANCHOR_ID,
  siteParam,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import {
  describeConnectors,
  siteTitle,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/utils/describe-connectors";
import { districtForPostalCode } from "@web/config/postal-districts";
import type { EvChargingLocation } from "@web/queries/ev-charging";
import { ChevronRight } from "lucide-react";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";

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
  const title = siteTitle(location);

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
            className="truncate"
            weight="semibold"
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
        {/* The row's click opens the site on the map; say so, since a hover
            tint alone does not show it on touch screens. */}
        <span className="flex shrink-0 items-center gap-0.5 font-semibold text-accent-strong text-xs">
          Map
          <ChevronRight aria-hidden className="size-4" />
        </span>
      </button>
    </li>
  );
}
