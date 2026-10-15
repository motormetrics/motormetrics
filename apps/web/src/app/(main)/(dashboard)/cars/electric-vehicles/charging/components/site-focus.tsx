"use client";

import { useMap } from "@heroui-pro/react/map";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";
import { useEffect, useEffectEvent } from "react";

/** Close enough to see the block a chosen site sits on. */
const SITE_ZOOM = 15;

/** Flies to the site named in the URL and hands it back to open its popup. */
export function SiteFocus({
  onFocus,
  site,
}: {
  onFocus: (site: EvChargingMapSite) => void;
  site: EvChargingMapSite | undefined;
}) {
  const { isLoaded, map } = useMap();
  const handleFocus = useEffectEvent(onFocus);

  useEffect(() => {
    if (!isLoaded || !map || !site) {
      return;
    }
    map.easeTo({
      center: [site.longitude, site.latitude],
      zoom: Math.max(map.getZoom(), SITE_ZOOM),
    });
    handleFocus(site);
  }, [isLoaded, map, site]);

  return null;
}
