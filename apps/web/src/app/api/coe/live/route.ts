import { db } from "@motormetrics/database/client";
import { coeInterimResults } from "@motormetrics/database/schema";
import { redis } from "@motormetrics/utils/redis";
import type { SealedLiveQuery } from "@neon/realtime/client";
import { createRealtime, rawSql } from "@neon/realtime/server";
import { LAST_UPDATED_COE_KEY } from "@web/config/workflow";
import { getResultsWindow } from "@web/lib/coe/results-window";
import { connection } from "next/server";

const NO_STORE = { "Cache-Control": "no-store" };

const noLiveQuery = () =>
  new Response(null, { status: 204, headers: NO_STORE });

export type CoeLiveState =
  | { status: "live"; query: SealedLiveQuery<InterimRow> }
  | { status: "pending" }
  | { status: "ready"; updatedAt: number };

type InterimRow = { month: string; bidding_no: number };

/**
 * Tells COE pages what to do during the results window:
 *
 * - `live`: today's results are not in yet, so subscribe to this sealed query
 *   on `coe_interim_results` (the browser never sees the Realtime secret).
 * - `pending`: the results are stored but the COE cache is not revalidated
 *   yet, so a refresh now would show the old results; ask again shortly.
 * - `ready`: the cache was revalidated at `updatedAt`; a page rendered before
 *   then should refresh.
 *
 * Returns 204 when there is nothing to watch: outside the window, or when
 * Realtime is not configured.
 */
export async function GET(): Promise<Response> {
  await connection();

  const secret = process.env.NEON_REALTIME_SECRET;
  const databaseUrl = process.env.DATABASE_URL;
  const now = new Date();
  const resultsWindow = getResultsWindow(now);
  if (
    !secret ||
    !databaseUrl ||
    !resultsWindow ||
    now.getTime() < resultsWindow.start
  ) {
    return noLiveQuery();
  }

  // Interim rows only exist between a close and the next day's CSV, so any
  // row inside the window means today's results are in.
  const [stored] = await db
    .select({ id: coeInterimResults.id })
    .from(coeInterimResults)
    .limit(1);
  if (stored) {
    // The interim workflow stamps this key only after revalidating the cache.
    const updatedAt = await redis.get<number>(LAST_UPDATED_COE_KEY);
    const state: CoeLiveState =
      updatedAt && updatedAt >= resultsWindow.start
        ? { status: "ready", updatedAt }
        : { status: "pending" };
    return Response.json(state, { headers: NO_STORE });
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
  const query = await realtime.seal({
    query: rawSql<InterimRow>(
      "select month, bidding_no from coe_interim_results",
    ),
  });

  const state: CoeLiveState = { status: "live", query };
  return Response.json(state, { headers: NO_STORE });
}
