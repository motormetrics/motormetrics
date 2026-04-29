import { asc, db, deregistrations } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

export async function getDeregistrations() {
  "use cache";
  cacheLife("max");
  cacheTag("deregistrations:months");

  return db.select().from(deregistrations).orderBy(asc(deregistrations.month));
}
