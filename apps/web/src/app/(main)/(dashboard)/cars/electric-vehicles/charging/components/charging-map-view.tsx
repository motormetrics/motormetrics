"use client";

import { Typography } from "@heroui/react";
// biome-ignore lint/suspicious/noShadowRestrictedNames: HeroUI Pro Map component
import { Map, type MapClusterLayerProps } from "@heroui-pro/react/map";
import {
  ISLAND_CENTER,
  ISLAND_ZOOM,
  type MapTokens,
  readTokens,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-map-shared";
import { DistrictFocus } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/district-focus";
import { SiteFocus } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/site-focus";
import { SiteLocator } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/site-locator";
import { SitePopup } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/site-popup";
import { siteParam } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";
import type { FeatureCollection, Point } from "geojson";
import { setWorkerUrl } from "maplibre-gl";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

/** Serves the same array that used to arrive as props. */
const MAP_SITES_ENDPOINT = "/api/ev-charging/map-sites";

/** Stable empty reference so the memos below do not rerun while loading. */
const NO_SITES: EvChargingMapSite[] = [];

interface SelectedSite {
  site: EvChargingMapSite;
  coordinates: [number, number];
  /** The district filter at the time of the click, so a change closes it. */
  district: string;
}

const toFeatureCollection = (
  sites: EvChargingMapSite[],
): FeatureCollection<Point, EvChargingMapSite> => ({
  type: "FeatureCollection",
  features: sites.map((site) => ({
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [site.longitude, site.latitude],
    },
    properties: site,
  })),
});

export function ChargingMapView() {
  const [district] = useQueryState("district", parseAsString.withDefault(""));
  const [loadedSites, setLoadedSites] = useState<EvChargingMapSite[] | null>(
    null,
  );
  const sites = loadedSites ?? NO_SITES;
  const [tokens, setTokens] = useState<MapTokens | null>(null);
  const [selected, setSelected] = useState<SelectedSite | null>(null);
  const [siteId, setSiteId] = useQueryState("site", siteParam);
  const collection = useMemo(() => toFeatureCollection(sites), [sites]);
  const focusedSite = useMemo(
    () =>
      siteId ? sites.find((site) => site.locationId === siteId) : undefined,
    [siteId, sites],
  );
  const focusSite = (site: EvChargingMapSite) => {
    setSelected({
      site,
      coordinates: [site.longitude, site.latitude],
      district,
    });
  };
  const closePopup = () => {
    setSelected(null);
    setSiteId(null);
  };

  useEffect(() => {
    setTokens(readTokens());
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const load = async () => {
      try {
        const response = await fetch(MAP_SITES_ENDPOINT, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Map sites request failed: ${response.status}`);
        }
        setLoadedSites((await response.json()) as EvChargingMapSite[]);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load charging map sites:", error);
        // An empty list shows the no-locations message in the map area.
        setLoadedSites(NO_SITES);
      }
    };

    void load();
    return () => controller.abort();
  }, []);

  const pointColor: MapClusterLayerProps["pointColor"] = tokens
    ? [
        "case",
        [">", ["get", "available"], 0],
        tokens.available,
        [">", ["get", "occupied"], 0],
        tokens.full,
        tokens.offline,
      ]
    : undefined;

  return (
    // A square on phones and 16:9 from md, so the island fits either way.
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl md:aspect-video">
      <Map
        center={ISLAND_CENTER}
        // Page scroll passes over the map; zooming takes Ctrl/⌘ + scroll,
        // and a phone pans with two fingers.
        cooperativeGestures
        styles={MAP_STYLES}
        theme="light"
        zoom={ISLAND_ZOOM}
      >
        <DistrictFocus district={district} sites={sites} />
        <SiteFocus onFocus={focusSite} site={focusedSite} />

        {tokens ? (
          <Map.ClusterLayer<EvChargingMapSite>
            clusterColors={[
              tokens.cluster,
              tokens.clusterStrong,
              tokens.clusterDeep,
            ]}
            clusterRadius={44}
            clusterThresholds={[10, 50]}
            data={collection}
            onPointClick={(feature, coordinates) => {
              setSelected({
                site: feature.properties,
                coordinates,
                district,
              });
            }}
            pointColor={pointColor}
          />
        ) : null}

        {selected && selected.district === district ? (
          <Map.Popup
            closeButton
            closeOnClick={false}
            focusAfterOpen={false}
            latitude={selected.coordinates[1]}
            longitude={selected.coordinates[0]}
            offset={12}
            onClose={closePopup}
          >
            <SitePopup site={selected.site} />
          </Map.Popup>
        ) : null}

        <Map.Controls position="top-right">
          <Map.LocateControl />
          <Map.ZoomControl />
        </Map.Controls>
      </Map>

      <SiteLocator
        onPick={(site) => setSiteId(site.locationId)}
        sites={sites}
      />

      {loadedSites === null ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/60 backdrop-blur-xs">
          <Typography.Paragraph color="muted" size="sm">
            Loading chargers…
          </Typography.Paragraph>
        </div>
      ) : null}

      {loadedSites?.length === 0 ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-surface/60 backdrop-blur-xs">
          <Typography.Paragraph color="muted" size="sm">
            No charger locations to show right now.
          </Typography.Paragraph>
        </div>
      ) : null}
    </div>
  );
}
