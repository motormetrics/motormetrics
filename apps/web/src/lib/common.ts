import { redis } from "@motormetrics/utils";
import { LAST_UPDATED_CARS_KEY, LAST_UPDATED_COE_KEY } from "@web/config";

/**
 * Load last updated timestamp for cars or COE data from Redis cache
 *
 * @param type - Data type to check ('cars' or 'coe')
 * @returns Last updated timestamp in milliseconds, or null if not available
 */
export const loadLastUpdated = async (
  type: "cars" | "coe",
): Promise<number | null> => {
  const key = type === "cars" ? LAST_UPDATED_CARS_KEY : LAST_UPDATED_COE_KEY;
  return redis.get<number>(key);
};
