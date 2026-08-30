import { createLoader, parseAsString } from "nuqs/server";

/** Parsers are exported for client-side reuse with `useQueryStates`. */
export const deregistrationsSearchParams = {
  month: parseAsString,
};

export const loadSearchParams = createLoader(deregistrationsSearchParams);
