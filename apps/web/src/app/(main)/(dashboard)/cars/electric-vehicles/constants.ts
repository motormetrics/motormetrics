import type {
  Powertrain,
  Range,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";

/** LTA DataMall fuel-type labels, grouped into the powertrains this page shows. */
export const EV_FUEL_TYPES = {
  BEV: ["Electric"],
  PHEV: ["Petrol-Electric (Plug-In)", "Diesel-Electric (Plug-In)"],
  Hybrid: ["Petrol-Electric", "Diesel-Electric"],
} as const;

/** Fuel type recorded against battery-electric vehicles in `vehicle_population`. */
export const ELECTRIC_POPULATION_FUEL_TYPE = "Electric";

/** LTA's Singapore Green Plan 2030 target for public charging points. */
export const CHARGING_POINT_TARGET_2030 = 60_000;

interface PowertrainSegment {
  /** Colour for the split bar and the trend chart. */
  colour: string;
  key: Powertrain;
  /** Used in legends, captions and on the tab pills. */
  label: string;
}

/**
 * The three powertrains `getEvMonthlyTrend()` returns, plus the combined view.
 * Ordered cleanest-to-dirtiest so the split bar reads left to right.
 */
export const POWERTRAIN_SEGMENTS: PowertrainSegment[] = [
  {
    colour: "var(--accent)",
    key: "bev",
    label: "Battery-electric",
  },
  {
    colour: "var(--chart-3)",
    key: "phev",
    label: "Plug-in hybrid",
  },
  {
    colour: "var(--chart-5)",
    key: "hybrid",
    label: "Hybrid",
  },
];

export const POWERTRAIN_TABS: { key: Powertrain; label: string }[] = [
  { key: "all", label: "All electrified" },
  ...POWERTRAIN_SEGMENTS.map(({ key, label }) => ({ key, label })),
];

/** Colour of everything that is neither battery-electric nor hybrid. */
export const COMBUSTION_COLOUR = "var(--accent-soft)";

export const RANGE_NOTES: Record<Range, string> = {
  "1Y": "12 months",
  "3Y": "3 years",
  All: "all months on record",
};
