import { createLoader, parseAsString } from "nuqs/server";

// Parsers are exported for client-side reuse with useQueryStates
export const deregistrationsSearchParams = {
  month: parseAsString,
  category: parseAsString.withDefault(""),
};

export const loadSearchParams = createLoader(deregistrationsSearchParams);
