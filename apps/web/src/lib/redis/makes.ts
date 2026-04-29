import { redis } from "@motormetrics/utils";
import { getDistinctMakes } from "@web/queries/cars";

const MAKES_SORTED_SET_KEY = "makes:alpha";

export { MAKES_SORTED_SET_KEY };

/**
 * Populates a Redis sorted set with all distinct car makes.
 * Uses score=0 for lexicographic ordering via ZRANGEBYLEX.
 */
export async function populateMakesSortedSet(): Promise<number> {
  const allMakes = await getDistinctMakes();
  const makes = allMakes.map((item) => item.make);

  if (makes.length === 0) return 0;

  await redis.del(MAKES_SORTED_SET_KEY);

  const pipeline = redis.pipeline();
  for (const make of makes) {
    pipeline.zadd(MAKES_SORTED_SET_KEY, { score: 0, member: make });
  }
  await pipeline.exec();

  return makes.length;
}
