import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const periods = ["12m", "5y", "10y", "ytd", "all"] as const;
export type Period = (typeof periods)[number];

/**
 * The series `/coe/results` plots on first load. Exported because the client
 * filter has to seed `useQueryState` with the same default the server loader
 * uses, or the first toggle would drop the unlisted categories.
 */
export const DEFAULT_COE_CATEGORIES = [
  "Category A",
  "Category B",
  "Category E",
];

export const coeSearchParams = {
  period: parseAsStringLiteral(periods).withDefault("12m"),
  categories: parseAsArrayOf(parseAsString).withDefault(DEFAULT_COE_CATEGORIES),
  month: parseAsString,
};

export const loadSearchParams = createLoader(coeSearchParams);
