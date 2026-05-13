import { neon } from "@neondatabase/serverless";
// import { upstashCache } from "drizzle-orm/cache/upstash";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

const sql = neon(process.env.DATABASE_URL as string);
export const db = drizzle({
  client: sql,
  // cache: upstashCache({
  //   url: process.env.UPSTASH_REDIS_REST_URL as string,
  //   token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
  //   config: { ex: CACHE_TTL },
  // }),
  schema,
  casing: "snake_case",
});
