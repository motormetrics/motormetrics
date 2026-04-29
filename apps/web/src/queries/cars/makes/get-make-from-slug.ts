import { redis, slugify } from "@motormetrics/utils";
import { MAKES_SORTED_SET_KEY } from "@web/lib/redis/makes";
import { getDistinctMakes } from "@web/queries/cars";
import type { Make } from "@web/types";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Resolves a URL slug (e.g., "mercedes-benz") to the exact DB make name
 * (e.g., "MERCEDES BENZ") using the Redis sorted set or DB fallback.
 */
export async function getMakeFromSlug(
  slug: string,
): Promise<string | undefined> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:makes");

  let makes = await redis.zrange<Make[]>(MAKES_SORTED_SET_KEY, 0, -1);

  if (!makes || makes.length === 0) {
    const dbMakes = await getDistinctMakes();
    makes = dbMakes.map((item) => item.make);
  }

  return makes.find((make) => slugify(make) === slug);
}
