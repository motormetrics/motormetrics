"use client";

import { SearchField, Typography } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
// biome-ignore lint/suspicious/noShadowRestrictedNames: HeroUI Pro Map component
import { Map, type MapClusterLayerProps, useMap } from "@heroui-pro/react/map";
import { siteParam } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/search-params";
import { inDistrict } from "@web/queries/ev-charging/locations";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";
import type { FeatureCollection, Point } from "geojson";
import { type LngLatBoundsLike, setWorkerUrl } from "maplibre-gl";
import { useQueryState } from "nuqs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { describeConnectors } from "./location-row";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

const MAP_MODES = [
  { key: "availability", label: "Live availability" },
  { key: "utilisation", label: "Busiest sites" },
] as const;

type MapMode = (typeof MAP_MODES)[number]["key"];

const MODE_LEGENDS: Record<MapMode, string> = {
  availability:
    "Green has free connectors · amber is full · grey is out of service",
  utilisation:
    "Warmer areas were occupied more often over the past week · sites under a day old are left out",
};

/** How many matches the locator card lists before asking for more letters. */
const LOCATOR_LIMIT = 5;

const siteTitle = (site: EvChargingMapSite) =>
  site.stationName ?? site.address ?? site.locationId;

/** Singapore, framed with a little sea on every side. */
const ISLAND_CENTER: [number, number] = [103.82, 1.36];
const ISLAND_ZOOM = 10.5;
/** Close enough to see the block a chosen site sits on. */
const SITE_ZOOM = 15;

/** MapLibre paints cannot read CSS variables, so tokens are resolved once. */
const readTokens = () => {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    available: read("--success", "#57b45f"),
    full: read("--warning", "#e9a63c"),
    offline: read("--subtle", "#5f6b71"),
    cluster: read("--accent", "#4e7c9b"),
    clusterStrong: read("--accent-strong", "#33586f"),
    clusterDeep: read("--accent-deep", "#16323f"),
    busy: read("--danger", "#e96e6e"),
  };
};

type MapTokens = ReturnType<typeof readTokens>;

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

/** Heat stops need translucency, which only a six-digit hex token can take. */
const withAlpha = (hex: string, alpha: string) =>
  /^#[0-9a-f]{6}$/i.test(hex) ? `${hex}${alpha}` : hex;

const HEATMAP_SOURCE_ID = "charging-utilisation-source";
const HEATMAP_LAYER_ID = "charging-utilisation-layer";

/**
 * Weekly occupancy as a heat layer, drawn beneath the basemap's labels.
 *
 * MapLibre has no React wrapper for heatmaps, so the layer is added to the
 * style by hand and removed again when the mode changes.
 */
function UtilisationHeatmap({
  collection,
  tokens,
}: {
  collection: FeatureCollection<Point, EvChargingMapSite>;
  tokens: MapTokens;
}) {
  const { isLoaded, map } = useMap();

  useEffect(() => {
    if (!isLoaded || !map) {
      return;
    }

    const addLayers = () => {
      if (map.getSource(HEATMAP_SOURCE_ID)) {
        return;
      }
      const beforeId = map
        .getStyle()
        .layers?.find((layer) => layer.type === "symbol")?.id;

      map.addSource(HEATMAP_SOURCE_ID, {
        type: "geojson",
        data: {
          ...collection,
          features: collection.features.filter(
            (feature) => feature.properties.utilisationPercent != null,
          ),
        },
      });
      map.addLayer(
        {
          id: HEATMAP_LAYER_ID,
          type: "heatmap",
          source: HEATMAP_SOURCE_ID,
          paint: {
            "heatmap-weight": [
              "/",
              ["coalesce", ["get", "utilisationPercent"], 0],
              100,
            ],
            "heatmap-intensity": 0.9,
            "heatmap-opacity": 0.8,
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              18,
              14,
              40,
            ],
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              withAlpha(tokens.cluster, "00"),
              0.25,
              withAlpha(tokens.cluster, "66"),
              0.5,
              withAlpha(tokens.available, "8c"),
              0.75,
              withAlpha(tokens.full, "b3"),
              1,
              withAlpha(tokens.busy, "d9"),
            ],
          },
        },
        beforeId,
      );
    };

    if (map.isStyleLoaded()) {
      addLayers();
    } else {
      map.once("idle", addLayers);
    }

    return () => {
      map.off("idle", addLayers);
      if (map.getLayer(HEATMAP_LAYER_ID)) {
        map.removeLayer(HEATMAP_LAYER_ID);
      }
      if (map.getSource(HEATMAP_SOURCE_ID)) {
        map.removeSource(HEATMAP_SOURCE_ID);
      }
    };
  }, [collection, isLoaded, map, tokens]);

  return null;
}

/** Zooms to the chosen district's sites, or back out to the whole island. */
function DistrictFocus({
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

/** Search card over the map that jumps to a site by name or address. */
function SiteLocator({
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

/** Flies to the site named in the URL and hands it back to open its popup. */
function SiteFocus({
  onFocus,
  site,
}: {
  onFocus: (site: EvChargingMapSite) => void;
  site: EvChargingMapSite | undefined;
}) {
  const { isLoaded, map } = useMap();

  useEffect(() => {
    if (!isLoaded || !map || !site) {
      return;
    }
    map.easeTo({
      center: [site.longitude, site.latitude],
      zoom: Math.max(map.getZoom(), SITE_ZOOM),
    });
    onFocus(site);
  }, [isLoaded, map, onFocus, site]);

  return null;
}

export function ChargingMapView({
  district,
  sites,
}: {
  district: string;
  sites: EvChargingMapSite[];
}) {
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
  // Read through a ref so a district change does not re-run the site focus.
  const districtRef = useRef(district);
  districtRef.current = district;
  const focusSite = useCallback((site: EvChargingMapSite) => {
    setMode("availability");
    setSelected({
      site,
      coordinates: [site.longitude, site.latitude],
      district: districtRef.current,
    });
  }, []);
  const closePopup = () => {
    setSelected(null);
    setSiteId(null);
  };

  useEffect(() => {
    setTokens(readTokens());
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

      <div className="relative h-[480px] w-full overflow-hidden rounded-3xl">
        <Map
          center={ISLAND_CENTER}
          styles={MAP_STYLES}
          theme="light"
          zoom={ISLAND_ZOOM}
        >
          <DistrictFocus district={district} sites={sites} />
          <SiteFocus onFocus={focusSite} site={focusedSite} />

          {tokens && mode === "utilisation" ? (
            <UtilisationHeatmap collection={collection} tokens={tokens} />
          ) : null}

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

          <Map.Controls>
            <Map.LocateControl />
            <Map.ZoomControl />
          </Map.Controls>
        </Map>

        <SiteLocator
          onPick={(site) => setSiteId(site.locationId)}
          sites={sites}
        />
      </div>

      <Typography.Paragraph color="muted" size="xs">
        {MODE_LEGENDS[mode]}
      </Typography.Paragraph>
    </>
  );
}

function SitePopup({ site }: { site: EvChargingMapSite }) {
  const title = siteTitle(site);
  const usable = site.connectors - site.unavailable;

  return (
    <div className="flex flex-col gap-1 pr-4 text-xs">
      <p className="font-semibold text-foreground">{title}</p>
      {site.address && site.address !== title ? (
        <p className="text-muted">{site.address}</p>
      ) : null}
      <p className="font-semibold tabular-nums">
        {site.available} of {usable} free
        {site.unavailable > 0 ? ` · ${site.unavailable} out of service` : ""}
      </p>
      <p className="text-muted">
        {[
          site.operator,
          describeConnectors(site),
          site.minPricePerKwh != null
            ? `from $${site.minPricePerKwh.toFixed(2)}/kWh`
            : null,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
    </div>
  );
}
