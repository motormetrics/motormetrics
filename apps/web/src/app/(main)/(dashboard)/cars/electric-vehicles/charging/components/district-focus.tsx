"use client";

import { useMap } from "@heroui-pro/react/map";
import {
  ISLAND_CENTER,
  ISLAND_ZOOM,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-map-shared";
import { inDistrict } from "@web/queries/ev-charging/locations";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";
import type { LngLatBoundsLike } from "maplibre-gl";
import { useEffect } from "react";

/** Zooms to the chosen district's sites, or back out to the whole island. */
export function DistrictFocus({
  district,
  sites,
}: {
  district: string;
  sites: EvChargingMapSite[];
}) {
  const { isLoaded, map } = useMap();

  useEffect(() => {
    if (!isLoaded || !map) {
      return;
    }
    const inScope = district
      ? sites.filter((site) => inDistrict(site.postalCode, district))
      : [];
    if (inScope.length === 0) {
      map.easeTo({ center: ISLAND_CENTER, zoom: ISLAND_ZOOM });
      return;
    }
    const longitudes = inScope.map((site) => site.longitude);
    const latitudes = inScope.map((site) => site.latitude);
    const bounds: LngLatBoundsLike = [
      [Math.min(...longitudes), Math.min(...latitudes)],
      [Math.max(...longitudes), Math.max(...latitudes)],
    ];
    map.fitBounds(bounds, { padding: 48, maxZoom: 14 });
  }, [district, isLoaded, map, sites]);

  return null;
}
