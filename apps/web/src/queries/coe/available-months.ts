import { db } from "@motormetrics/database/client";
import { coeResults } from "@motormetrics/database/schema";
import { desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getCoeMonths(): Promise<{ month: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:months");

  return db
    .selectDistinct({ month: coeResults.month })
    .from(coeResults)
    .orderBy(desc(coeResults.month));
}
