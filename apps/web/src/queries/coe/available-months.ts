import { db } from "@motormetrics/database/client";
import { coe } from "@motormetrics/database/schema";
import { desc } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getCoeMonths(): Promise<{ month: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag("coe:months");

  return db
    .selectDistinct({ month: coe.month })
    .from(coe)
    .orderBy(desc(coe.month));
}
