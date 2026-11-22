import { db } from "@motormetrics/database/client";
import { coeInterimResults } from "@motormetrics/database/schema";
import { createRealtime, rawSql } from "@neon/realtime/server";
import { isInResultsWindow } from "@web/lib/coe/results-window";
import { connection } from "next/server";

const NO_STORE = { "Cache-Control": "no-store" };

const noLiveQuery = () =>
  new Response(null, { status: 204, headers: NO_STORE });

/**
 * Seals the live query COE pages subscribe to during the results window, so a
 * browser can watch `coe_interim_results` without the Realtime secret.
 *
 * Returns 204 when there is nothing to watch: outside the window, once the
 * day's results are already stored (a page opened then gets them from the
 * server render), or when Realtime is not configured.
 */
export async function GET(): Promise<Response> {
  await connection();

  const secret = process.env.NEON_REALTIME_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  if (!secret || !databaseUrl || !isInResultsWindow(new Date())) {
    return noLiveQuery();
  }

  // Interim rows only exist between a close and the next day's CSV, so any
  // row inside the window means today's results are in.
  const [stored] = await db
    .select({ id: coeInterimResults.id })
    .from(coeInterimResults)
    .limit(1);
  if (stored) {
    return noLiveQuery();
  }

  const realtime = createRealtime({
    secret,
    db: new URL(databaseUrl).pathname.slice(1),
  });
  // Raw SQL because @neon/realtime-drizzle supports drizzle-orm 0.45 only and
  // this repo is on Drizzle 1.0. The query has no parameters.
  // TODO: switch to drizzleAdapter() from @neon/realtime-drizzle and seal a
  // Drizzle select on coeInterimResults once its drizzle-orm peer range
  // includes 1.x (0.2.0 allows >=0.45.2 <0.46.0).
  const sealed = await realtime.seal({
    query: rawSql<{ month: string; bidding_no: number }>(
      "select month, bidding_no from coe_interim_results",
    ),
  });

  return Response.json(sealed, { headers: NO_STORE });
}
