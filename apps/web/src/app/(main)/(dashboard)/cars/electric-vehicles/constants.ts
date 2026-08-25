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

export const ALL_EV_FUEL_TYPES = [
  ...EV_FUEL_TYPES.BEV,
  ...EV_FUEL_TYPES.PHEV,
  ...EV_FUEL_TYPES.Hybrid,
];

/** Fuel type recorded against battery-electric vehicles in `vehicle_population`. */
export const ELECTRIC_POPULATION_FUEL_TYPE = "Electric";

interface PowertrainSegment {
  /** Colour for the split bar and the trend chart. */
  colour: string;
  key: Powertrain;
  /** Long form, used in legends and captions. */
  label: string;
  /** Short form, used on the tab pills. */
  tab: string;
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
    tab: "Battery-electric",
  },
  {
    colour: "var(--chart-3)",
    key: "phev",
    label: "Plug-in hybrid",
    tab: "Plug-in hybrid",
  },
  {
    colour: "var(--accent-on-dark)",
    key: "hybrid",
    label: "Hybrid",
    tab: "Hybrid",
  },
];

export const POWERTRAIN_TABS: { key: Powertrain; label: string }[] = [
  { key: "all", label: "All electrified" },
  ...POWERTRAIN_SEGMENTS.map(({ key, tab }) => ({ key, label: tab })),
];

/** Colour of everything that is neither battery-electric nor hybrid. */
export const COMBUSTION_COLOUR = "var(--accent-soft)";

export const RANGE_NOTES: Record<Range, string> = {
  "1Y": "12 months",
  "3Y": "3 years",
  All: "all months on record",
};
