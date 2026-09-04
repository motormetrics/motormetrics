"use client";

// biome-ignore lint/suspicious/noShadowRestrictedNames: HeroUI Pro Map component
import { Map, type MapClusterLayerProps, useMap } from "@heroui-pro/react/map";
import { inDistrict } from "@web/queries/ev-charging/locations";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";
import type { FeatureCollection, Point } from "geojson";
import { type LngLatBoundsLike, setWorkerUrl } from "maplibre-gl";
import { useEffect, useMemo, useState } from "react";
import { describeConnectors } from "./location-row";

setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

const MAP_STYLES = {
  light: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
  dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
};

/** Singapore, framed with a little sea on every side. */
const ISLAND_CENTER: [number, number] = [103.82, 1.36];
const ISLAND_ZOOM = 10.5;

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

export function ChargingMapView({
  district,
  sites,
}: {
  district: string;
  sites: EvChargingMapSite[];
}) {
  const [tokens, setTokens] = useState<MapTokens | null>(null);
  const [selected, setSelected] = useState<SelectedSite | null>(null);
  const collection = useMemo(() => toFeatureCollection(sites), [sites]);

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
    <div className="relative h-[480px] w-full overflow-hidden rounded-3xl">
      <Map
        center={ISLAND_CENTER}
        styles={MAP_STYLES}
        theme="light"
        zoom={ISLAND_ZOOM}
      >
        <DistrictFocus district={district} sites={sites} />

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
              setSelected({ site: feature.properties, coordinates, district });
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
            onClose={() => setSelected(null)}
          >
            <SitePopup site={selected.site} />
          </Map.Popup>
        ) : null}

        <Map.Controls>
          <Map.ZoomControl />
        </Map.Controls>
      </Map>
    </div>
  );
}

function SitePopup({ site }: { site: EvChargingMapSite }) {
  const title = site.stationName ?? site.address ?? site.locationId;
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
