import type {
  Powertrain,
  Range,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";

/** Fuel type recorded against battery-electric vehicles in `vehicle_population`. */
export const ELECTRIC_POPULATION_FUEL_TYPE = "Electric";

/** LTA's Singapore Green Plan 2030 target for public charging points. */
export const CHARGING_POINT_TARGET_2030 = 60_000;

interface PowertrainSegment {
  /** Colour for the split bar and the trend chart. */
  colour: string;
  key: Powertrain;
  /** Used in legends, captions and the fuel type filter. */
  label: string;
}

/**
 * The three groups `getEvMonthlyTrend()` returns, plus the combined view.
 *
 * `bev` is exactly LTA's "Electric" fuel type, so it takes that name. The
 * other two are wider than one LTA fuel type (`EV_FUEL_TYPES` in the config):
 * `phev` is "Petrol-Electric (Plug-In)" plus "Diesel-Electric (Plug-In)" and
 * `hybrid` is "Petrol-Electric" plus "Diesel-Electric". Naming either after
 * the petrol fuel type alone would mislabel it, so each label names both.
 */
export const POWERTRAIN_SEGMENTS: PowertrainSegment[] = [
  {
    colour: "var(--chart-1)",
    key: "bev",
    label: "Electric",
  },
  {
    colour: "var(--chart-3)",
    key: "phev",
    label: "Petrol-Electric and Diesel-Electric (Plug-In)",
  },
  {
    colour: "var(--chart-5)",
    key: "hybrid",
    label: "Petrol-Electric and Diesel-Electric",
  },
];

export const POWERTRAIN_TABS: { key: Powertrain; label: string }[] = [
  { key: "all", label: "All" },
  ...POWERTRAIN_SEGMENTS.map(({ key, label }) => ({ key, label })),
];

/** Colour of everything that is neither electric nor part-electric. */
export const COMBUSTION_COLOUR = "var(--chart-2)";

/** The trend range filter's options, as the reader sees them. */
export const RANGE_LABELS: Record<Range, string> = {
  "1Y": "1 year",
  "3Y": "3 years",
  All: "All",
};

/** Period captions for the fixed ranges; "All" names its first month instead. */
export const RANGE_NOTES: Record<Exclude<Range, "All">, string> = {
  "1Y": "12 months",
  "3Y": "36 months",
};
