import { createLoader, parseAsString } from "nuqs/server";

export const searchParams = {
  month: parseAsString,
};

export const loadSearchParams = createLoader(searchParams);
