"use client";

import { SearchField, Typography } from "@heroui/react";
import { siteTitle } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/utils/describe-connectors";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";
import { useMemo, useState } from "react";

/** How many matches the locator card lists before asking for more letters. */
const LOCATOR_LIMIT = 5;

/** Search card over the map that jumps to a site by name or address. */
export function SiteLocator({
  onPick,
  sites,
}: {
  onPick: (site: EvChargingMapSite) => void;
  sites: EvChargingMapSite[];
}) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const matches = useMemo(() => {
    if (needle.length < 2) {
      return [];
    }
    return sites
      .filter((site) =>
        [site.stationName, site.address, site.operator]
          .filter(Boolean)
          .some((text) => text?.toLowerCase().includes(needle)),
      )
      .slice(0, LOCATOR_LIMIT);
  }, [needle, sites]);

  return (
    <div className="absolute top-3 left-3 z-10 flex w-64 max-w-[calc(100%-1.5rem)] flex-col gap-2 rounded-2xl bg-overlay p-3 shadow-overlay">
      <SearchField
        aria-label="Find a charging site"
        fullWidth
        onChange={setQuery}
        value={query}
        variant="secondary"
      >
        <SearchField.Group>
          <SearchField.SearchIcon />
          <SearchField.Input placeholder="Find a site or address" />
          <SearchField.ClearButton />
        </SearchField.Group>
      </SearchField>

      {needle.length >= 2 ? (
        matches.length === 0 ? (
          <Typography.Paragraph className="px-1" color="muted" size="xs">
            No sites match.
          </Typography.Paragraph>
        ) : (
          <ul className="flex flex-col">
            {matches.map((site) => (
              <li key={site.locationId}>
                <button
                  className="flex w-full cursor-pointer flex-col rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-surface-tertiary"
                  onClick={() => {
                    onPick(site);
                    setQuery("");
                  }}
                  type="button"
                >
                  <span className="truncate font-semibold text-xs">
                    {siteTitle(site)}
                  </span>
                  <span className="truncate text-muted text-xs">
                    {site.available} free · {site.operator ?? site.address}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )
      ) : null}
    </div>
  );
}
