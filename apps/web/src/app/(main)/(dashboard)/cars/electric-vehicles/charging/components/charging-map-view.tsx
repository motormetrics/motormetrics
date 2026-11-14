"use client";

import { Typography } from "@heroui/react";
// import { Segment } from "@heroui-pro/react";
// biome-ignore lint/suspicious/noShadowRestrictedNames: HeroUI Pro Map component
import { Map, type MapClusterLayerProps, useMap } from "@heroui-pro/react/map";
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
// import { UtilisationHeatmap } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/utilisation-heatmap";
import { siteParam } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
// import { getPostalDistrict } from "@web/config/postal-districts";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";
import type { FeatureCollection, Point } from "geojson";
import { setWorkerUrl } from "maplibre-gl";
import { parseAsString, useQueryState } from "nuqs";
import { type ReactNode, useEffect, useMemo, useState } from "react";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

// The "Busiest sites" mode is paused with the hourly utilisation history.
const MAP_MODES = [
  { key: "availability", label: "Live availability" },
  // { key: "utilisation", label: "Busiest sites" },
] as const;

type MapMode = (typeof MAP_MODES)[number]["key"];

// The legend lives in the live chip on the map now (see `LiveChip`).
// const MODE_LEGENDS: Record<MapMode, string> = {
//   availability:
//     "Green has free connectors · amber is full · grey is out of service",
//   // utilisation:
//   //   "Warmer areas were occupied more often over the past week · sites under a day old are left out",
// };

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

export function ChargingMapView({
  liveStatus,
}: {
  /** Streamed live availability chip, shown above the map controls. */
  liveStatus?: ReactNode;
}) {
  const [district] = useQueryState("district", parseAsString.withDefault(""));
  // const scope = getPostalDistrict(district)?.name ?? "Singapore";
  const [loadedSites, setLoadedSites] = useState<EvChargingMapSite[] | null>(
    null,
  );
  const sites = loadedSites ?? NO_SITES;
  const [tokens, setTokens] = useState<MapTokens | null>(null);
  const [mode, setMode] = useState<MapMode>("availability");
  const [selected, setSelected] = useState<SelectedSite | null>(null);
  const [siteId, setSiteId] = useQueryState("site", siteParam);
  const collection = useMemo(() => toFeatureCollection(sites), [sites]);
  const focusedSite = useMemo(
    () =>
      siteId ? sites.find((site) => site.locationId === siteId) : undefined,
    [siteId, sites],
  );
  const focusSite = (site: EvChargingMapSite) => {
    setMode("availability");
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
    <>
      {/* The map runs edge to edge with no card, so its heading went; the
          live chip on the map names what it shows.
      <div className="flex flex-col gap-1">
        <Typography.Paragraph color="muted">
          Live availability by site
        </Typography.Paragraph>
        <Typography.Heading level={3}>Chargers in {scope}</Typography.Heading>
      </div>
      */}

      {/* One mode is left, so the switcher is hidden until utilisation returns.
      <Segment
        aria-label="Map view"
        className="w-fit"
        onSelectionChange={(key) => {
          setMode(key as MapMode);
          closePopup();
        }}
        selectedKey={mode}
      >
        {MAP_MODES.map((option) => (
          <Segment.Item id={option.key} key={option.key}>
            {option.label}
          </Segment.Item>
        ))}
      </Segment>
      */}

      {/*
        Heights: 640px on wider screens is off Tailwind's spacing scale (it
        stops at h-96), and no preset gives a map tall enough to leave its top
        half clear of the overlapping price cards, so it stays arbitrary.

        The MapLibre credit sits in its bottom-right control corner, which the
        price cards cover. The arbitrary variants lift that corner by the
        overlap so the credit stays visible; HeroUI's Map has
        no prop to place it.
      */}
      <div className="relative h-96 w-full overflow-hidden md:h-[640px] [&_.maplibregl-ctrl-bottom-right]:bottom-24 md:[&_.maplibregl-ctrl-bottom-right]:bottom-80">
        <Map
          center={ISLAND_CENTER}
          // Page scroll passes over the map; zooming takes Ctrl/⌘ + scroll,
          // and a phone pans with two fingers.
          cooperativeGestures
          styles={MAP_STYLES}
          theme="light"
          zoom={ISLAND_ZOOM}
        >
          <MapOverlap />
          <DistrictFocus district={district} sites={sites} />
          <SiteFocus onFocus={focusSite} site={focusedSite} />

          {/* {tokens && mode === "utilisation" ? (
            <UtilisationHeatmap collection={collection} tokens={tokens} />
          ) : null} */}

          {tokens && mode === "availability" ? (
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

          {/* Top-right: the bottom corners are under the price cards. */}
          <Map.Controls position="top-right">
            {liveStatus}
            <Map.LocateControl />
            <Map.ZoomControl />
          </Map.Controls>
        </Map>

        <SiteLocator
          onPick={(site) => setSiteId(site.locationId)}
          sites={sites}
        />

        {/* Status messages centre in the uncovered part of the map. */}
        {loadedSites === null ? (
          <div className="absolute inset-x-0 top-0 bottom-24 z-10 flex items-center justify-center bg-surface/60 backdrop-blur-xs md:bottom-80">
            <Typography.Paragraph color="muted" size="sm">
              Loading chargers…
            </Typography.Paragraph>
          </div>
        ) : null}

        {loadedSites?.length === 0 ? (
          <div className="absolute inset-x-0 top-0 bottom-24 z-10 flex items-center justify-center bg-surface/60 backdrop-blur-xs md:bottom-80">
            <Typography.Paragraph color="muted" size="sm">
              No charger locations to show right now.
            </Typography.Paragraph>
          </div>
        ) : null}
      </div>

      {/* The legend moved into the live chip on the map; this line would sit
          under the overlapping price cards.
      <Typography.Paragraph color="muted" size="xs">
        {MODE_LEGENDS[mode]}
      </Typography.Paragraph>
      */}
    </>
  );
}

/**
 * Pads the camera's bottom edge by the overlap, so the island, a fitted
 * district and a focused site centre in the part of the map the price cards
 * leave clear. The 96 and 320 px mirror the page's `-mt-24 md:-mt-80`, and
 * follow the breakpoint as the window resizes.
 */
function MapOverlap() {
  const { isLoaded, map } = useMap();

  useEffect(() => {
    if (!isLoaded || !map) {
      return;
    }
    const wide = window.matchMedia("(width >= 48rem)");
    const applyPadding = () => {
      map.setPadding({
        top: 0,
        right: 0,
        bottom: wide.matches ? 320 : 96,
        left: 0,
      });
    };
    applyPadding();
    wide.addEventListener("change", applyPadding);
    return () => wide.removeEventListener("change", applyPadding);
  }, [isLoaded, map]);

  return null;
}
