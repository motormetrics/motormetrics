import { neon } from "@neondatabase/serverless";
// import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/neon-http";
import { relations } from "./relations";

// const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

const sql = neon(process.env.DATABASE_URL as string);
export const db = drizzle({
  client: sql,
  // cache: upstashCache({
  //   url: process.env.UPSTASH_REDIS_REST_URL as string,
  //   token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  //   config: { ex: CACHE_TTL },
  // }),
  // Drizzle v1 replaces the `schema` option with `relations` — the two are
  // mutually exclusive, and `db.query` (RQB v2) is powered by this config.
  // Casing is no longer set here either; it moved to the table level
  // (`snakeCase.table`) in `src/schema`.
  relations,
});
