import {
  createLoader,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";

const currentYear = new Date().getFullYear();

export const VIEWS = ["fuel-type", "make"] as const;
export type View = (typeof VIEWS)[number];

export const searchParams = {
  year: parseAsInteger.withDefault(currentYear),
  view: parseAsStringLiteral(VIEWS).withDefault("fuel-type"),
};

export const loadSearchParams = createLoader(searchParams);
