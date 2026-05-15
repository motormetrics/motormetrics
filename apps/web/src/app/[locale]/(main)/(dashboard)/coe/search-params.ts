import {
  createLoader,
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
} from "nuqs/server";

export const periods = ["12m", "5y", "10y", "ytd", "all"] as const;
export type Period = (typeof periods)[number];

const defaultCategories = ["Category A", "Category B", "Category E"];

export const coeSearchParams = {
  period: parseAsStringLiteral(periods).withDefault("12m"),
  categories: parseAsArrayOf(parseAsString).withDefault(defaultCategories),
  month: parseAsString,
};

export const loadSearchParams = createLoader(coeSearchParams);
