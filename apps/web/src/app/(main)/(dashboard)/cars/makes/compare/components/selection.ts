import { slugify } from "@motormetrics/utils/slugify";

/** A make as the selectors list it: the DB name and its URL slug. */
export interface MakeOption {
  name: string;
  slug: string;
}

/**
 * The makes to compare from the `?make=` values, in the order given (it sets
 * the left column). Values are lowercased and trimmed; empty, unknown and
 * repeated slugs are dropped, and only the first two survive. Fewer than two
 * is the empty state, but a single valid make is still returned so the first
 * selector can keep it.
 */
export function selectMakes(
  values: readonly string[],
  knownSlugs: readonly string[],
): string[] {
  const known = new Set(knownSlugs);
  const selected: string[] = [];

  for (const value of values) {
    const makeSlug = value.trim().toLowerCase();
    if (makeSlug && known.has(makeSlug) && !selected.includes(makeSlug)) {
      selected.push(makeSlug);
    }
    if (selected.length === 2) {
      break;
    }
  }

  return selected;
}

/**
 * Every make as a selector option, sorted by name. Two DB names that slugify
 * alike would collide as option ids, so only the first is kept.
 */
export function makeOptions(rows: readonly { make: string }[]): MakeOption[] {
  const bySlug = new Map<string, MakeOption>();

  for (const { make } of rows) {
    const makeSlug = slugify(make);
    if (!bySlug.has(makeSlug)) {
      bySlug.set(makeSlug, { name: make, slug: makeSlug });
    }
  }

  return [...bySlug.values()].sort((a, b) => a.name.localeCompare(b.name));
}
