import { CATEGORY_KEYS } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/**
 * URL state for `/coe/premiums`.
 *
 * Kept apart from `coe/search-params.ts`, which carries the period and series
 * selection `/coe/results` filters on and neither of which this page has. The
 * category travels as a bare letter so the URL reads `?category=B`, matching
 * the overview at `/coe`.
 */

/** How far back the premium chart reaches. */
export const PREMIUM_RANGES = ["1Y", "3Y", "All"] as const;
export type PremiumRange = (typeof PREMIUM_RANGES)[number];

/**
 * Each range as a count of bidding exercises, since two run in most months.
 * `All` is unbounded — `slice(-Infinity)` keeps the whole series.
 */
export const RANGE_EXERCISES: Record<PremiumRange, number> = {
  "1Y": 24,
  "3Y": 72,
  All: Number.POSITIVE_INFINITY,
};

export const premiumsSearchParams = {
  category: parseAsStringLiteral(CATEGORY_KEYS).withDefault("A"),
  month: parseAsString,
  range: parseAsStringLiteral(PREMIUM_RANGES).withDefault("1Y"),
};

export const loadSearchParams = createLoader(premiumsSearchParams);
