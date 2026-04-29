import { coe, db, desc } from "@motormetrics/database";
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
