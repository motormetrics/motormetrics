import { createLoader, parseAsString } from "nuqs/server";

export const carsSearchParams = {
  month: parseAsString,
  compareA: parseAsString,
  compareB: parseAsString,
};

export const loadSearchParams = createLoader(carsSearchParams);
