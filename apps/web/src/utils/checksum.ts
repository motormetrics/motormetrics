import path from "node:path";
import { redis, slugify } from "@motormetrics/utils";
import type { Redis } from "@upstash/redis";

export class Checksum {
  private redis: Redis;

  constructor(redisInstance: Redis = redis) {
    this.redis = redisInstance;
  }

  /**
   * Caches a checksum value for a given file name
   *
   * @param fileName Name of the file to cache checksum for
   * @param checksum The checksum value to cache
   * @returns Promise resolving to the number of fields added (0 or 1) or null if failed
   */
  async cacheChecksum(fileName: string, checksum: string) {
    try {
      const key = slugify(path.parse(fileName).name);
      return await this.redis.hset("checksum", { [key]: checksum });
    } catch (error) {
      console.error(`Error caching checksum: ${error}`);
      return null;
    }
  }

  /**
   * Retrieves a cached checksum value for a given file name
   *
   * @param fileName Name of the file to get checksum for
   * @returns Promise resolving to the cached checksum string or null if not found/error
   */
  async getCachedChecksum(fileName: string) {
    try {
      const key = slugify(path.parse(fileName).name);
      return await this.redis.hget<string>("checksum", key);
    } catch (error) {
      console.error(`Error retrieving cached checksum: ${error}`);
      return null;
    }
  }
}
