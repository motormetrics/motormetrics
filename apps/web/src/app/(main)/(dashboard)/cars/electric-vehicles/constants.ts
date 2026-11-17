import type {
  Powertrain,
  Range,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";

/** LTA's Singapore Green Plan 2030 target for public charging points. */
export const CHARGING_POINT_TARGET_2030 = 60_000;

/** The powertrain switch on the registration trend card. */
export const POWERTRAIN_TABS: { key: Powertrain; label: string }[] = [
  { key: "all", label: "All electrified" },
  { key: "bev", label: "Battery-electric" },
  { key: "phev", label: "Plug-in hybrid" },
  { key: "hybrid", label: "Hybrid" },
];

/** Period captions for the fixed ranges; "All" names its first month instead. */
export const RANGE_NOTES: Record<Exclude<Range, "All">, string> = {
  "1Y": "12 months",
  "3Y": "36 months",
};
