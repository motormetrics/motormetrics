"use client";

import { useMap } from "@heroui-pro/react/map";
import type { MapTokens } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/charging/components/charging-map-shared";
import type { EvChargingMapSite } from "@web/queries/ev-charging/map-sites";
import type { FeatureCollection, Point } from "geojson";
import { useEffect } from "react";

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
export function UtilisationHeatmap({
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
            // Sites spread apart as the map zooms in, so density has to be
            // boosted to keep the colour ramp from fading out.
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              10,
              0.9,
              13,
              2,
              16,
              5,
            ],
            "heatmap-opacity": 0.8,
            "heatmap-radius": [
              "interpolate",
              ["exponential", 1.5],
              ["zoom"],
              10,
              18,
              14,
              60,
              17,
              160,
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
