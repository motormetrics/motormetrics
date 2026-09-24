import { periods } from "@web/types/coe";
import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

/**
 * The series `/coe/results` plots on first load. The client filter reads it
 * through `coeSearchParams.categories`, so both sides share one default.
 */
const DEFAULT_COE_CATEGORIES = ["Category A", "Category B", "Category E"];

export const coeSearchParams = {
  period: parseAsStringLiteral(periods).withDefault("12m"),
  categories: parseAsArrayOf(parseAsString).withDefault(DEFAULT_COE_CATEGORIES),
};

export const loadSearchParams = createLoader(coeSearchParams);
