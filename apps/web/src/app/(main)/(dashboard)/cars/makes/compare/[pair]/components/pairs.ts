/**
 * The make pairs the comparison page covers, as make slugs, in their canonical
 * order. Only these are prerendered, linked and listed in the sitemap; any
 * other slug — the reversed order included — 404s, so every link a reader can
 * follow leads to a page that exists.
 */
export const COMPARE_PAIRS = [
  ["bmw", "mercedes-benz"],
  ["bmw", "audi"],
  ["mercedes-benz", "audi"],
  ["byd", "tesla"],
  ["toyota", "honda"],
  ["byd", "toyota"],
] as const;

export type ComparePair = (typeof COMPARE_PAIRS)[number];

/** `["bmw", "audi"]` → `"bmw-vs-audi"`. */
export function pairSlug([makeA, makeB]: ComparePair): string {
  return `${makeA}-vs-${makeB}`;
}

/**
 * The curated pair a URL slug names, or `undefined`. Matched against the whole
 * slug rather than split on "-", since make slugs carry hyphens of their own
 * ("mercedes-benz").
 */
export function findPair(slug: string): ComparePair | undefined {
  return COMPARE_PAIRS.find((pair) => pairSlug(pair) === slug);
}

/** The curated pairs a make slug appears in, in canonical order. */
export function pairsWithMake(makeSlug: string): ComparePair[] {
  return COMPARE_PAIRS.filter((pair) =>
    (pair as readonly string[]).includes(makeSlug),
  );
}

/** Every curated pair except the one `slug` names, in canonical order. */
export function otherPairs(slug: string): ComparePair[] {
  return COMPARE_PAIRS.filter((pair) => pairSlug(pair) !== slug);
}
