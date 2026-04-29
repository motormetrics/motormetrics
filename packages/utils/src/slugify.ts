import baseSlugify from "@sindresorhus/slugify";

/**
 * Slugify a string with default options for URL-safe slugs.
 * Handles camelCase splitting, underscores, and special character removal.
 *
 * @param input - String to slugify
 * @returns URL-safe slug
 *
 * @example
 * slugify("Singapore's Top Cars") // "singapores-top-cars"
 * slugify("Multi-purpose Vehicle") // "multi-purpose-vehicle"
 * slugify("M11-coe_results") // "m11-coe-results"
 * slugify("MVP01-6_Cars_by_make") // "mvp01-6-cars-by-make"
 */
export function slugify(input: string): string {
  return baseSlugify(input, { decamelize: false });
}
