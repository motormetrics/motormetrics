import { slugify } from "@motormetrics/utils/slugify";
import { getDistinctMakes } from "@web/queries/cars/filter-options";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Resolves a URL slug (e.g., "mercedes-benz") to the exact DB make name
 * (e.g., "MERCEDES BENZ").
 */
export async function getMakeFromSlug(
  slug: string,
): Promise<string | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:makes");

  const dbMakes = await getDistinctMakes();

  return dbMakes
    .map((item) => item.make)
    .find((make) => slugify(make) === slug);
}
