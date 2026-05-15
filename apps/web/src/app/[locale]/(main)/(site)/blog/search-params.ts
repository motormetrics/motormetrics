import { createLoader, parseAsString } from "nuqs/server";

export const blogSearchParams = {
  q: parseAsString.withDefault(""),
};

export const loadSearchParams = createLoader(blogSearchParams);
