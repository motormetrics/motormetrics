import { db, deregistrations, sql } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get the latest month available in deregistrations data
 */
export async function getDeregistrationsLatestMonth() {
  "use cache";
  cacheLife("max");
  cacheTag("deregistrations:months");

  const [result] = await db
    .select({ month: sql<string>`max(${deregistrations.month})` })
    .from(deregistrations);

  return result;
}
