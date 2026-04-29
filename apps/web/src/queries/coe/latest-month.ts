import { coe, db, desc, max } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Get the latest month with COE bidding data
 */
export async function getCOELatestMonth(): Promise<string | null> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:months");

  const [{ latestMonth }] = await db
    .select({ latestMonth: max(coe.month) })
    .from(coe);

  return latestMonth ?? null;
}

/**
 * Get the latest COE record with month and biddingNo.
 * Used by workflows to check if we should generate a post.
 */
export async function getCOELatestRecord() {
  return db.query.coe.findFirst({ orderBy: desc(coe.month) });
}
