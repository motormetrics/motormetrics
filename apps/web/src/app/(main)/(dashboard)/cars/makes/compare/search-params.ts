import { createLoader, parseAsNativeArrayOf, parseAsString } from "nuqs/server";

/**
 * The makes to compare, as a repeated key: `?make=bmw&make=mercedes-benz`.
 * A native `<form method="get">` with two `name="make"` controls submits in
 * exactly this shape, so the selectors work without JavaScript.
 */
const compareSearchParams = {
  make: parseAsNativeArrayOf(parseAsString),
};

export const loadSearchParams = createLoader(compareSearchParams);
