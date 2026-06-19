import {
  createLoader,
  parseAsInteger,
  parseAsStringLiteral,
} from "nuqs/server";

export type { View } from "@web/app/(main)/(dashboard)/cars/annual/constants";
export { VIEWS } from "@web/app/(main)/(dashboard)/cars/annual/constants";

const currentYear = new Date().getFullYear();

export const searchParams = {
  year: parseAsInteger.withDefault(currentYear),
  view: parseAsStringLiteral(VIEWS).withDefault("fuel-type"),
};

export const loadSearchParams = createLoader(searchParams);
