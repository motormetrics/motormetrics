import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/**
 * Which powertrain the registration trend chart plots. The comp tabs through
 * individual makes here; the repo has no per-make monthly EV series, so the
 * tabs segment the series we do have — see `constants.ts`.
 */
export const POWERTRAINS = ["all", "bev", "phev", "hybrid"] as const;
export type Powertrain = (typeof POWERTRAINS)[number];

/** How far back the registration trend chart reaches from the selected month. */
export const RANGES = ["1Y", "3Y", "All"] as const;
export type Range = (typeof RANGES)[number];

export const evSearchParams = {
  month: parseAsString,
  powertrain: parseAsStringLiteral(POWERTRAINS).withDefault("all"),
  range: parseAsStringLiteral(RANGES).withDefault("1Y"),
};

export const loadSearchParams = createLoader(evSearchParams);
