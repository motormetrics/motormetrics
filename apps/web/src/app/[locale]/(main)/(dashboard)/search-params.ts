import { createLoader, parseAsInteger } from "nuqs/server";

const currentYear = new Date().getFullYear();

export const searchParams = {
  year: parseAsInteger.withDefault(currentYear),
};

export const loadSearchParams = createLoader(searchParams);
