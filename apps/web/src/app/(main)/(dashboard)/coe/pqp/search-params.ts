import { PQP_REPORTED_CATEGORIES } from "@web/queries/coe";
import { createLoader, parseAsStringLiteral } from "nuqs/server";

/** `"Category A"` → `"A"`, the short key the page's URL and tabs use. */
type CategoryKey<T extends string> = T extends `Category ${infer Key}`
  ? Key
  : never;

/**
 * The categories the page reports on, derived from the query's list so the two
 * cannot drift. To bring Categories C and D back, widen
 * `PQP_REPORTED_CATEGORIES` in `queries/coe/pqp/overview.ts` — this, the tabs
 * and every table follow from it.
 */
export type PQPCategoryKey = CategoryKey<
  (typeof PQP_REPORTED_CATEGORIES)[number]
>;

export const PQP_CATEGORY_KEYS: readonly PQPCategoryKey[] =
  PQP_REPORTED_CATEGORIES.map(
    (category) => category.slice("Category ".length) as PQPCategoryKey,
  );

/** Renewal terms, in years. Ten costs the full PQP, five costs half. */
export const PQP_TERMS = ["5", "10"] as const;
export type PQPTerm = (typeof PQP_TERMS)[number];

export const searchParams = {
  category: parseAsStringLiteral(PQP_CATEGORY_KEYS).withDefault(
    PQP_CATEGORY_KEYS[0],
  ),
  term: parseAsStringLiteral(PQP_TERMS).withDefault("10"),
};

export const loadSearchParams = createLoader(searchParams);
