import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";
import {
  type ConnectorRecord,
  extractLastUpdated,
  fetchBatch,
  parseBatch,
} from "@web/lib/ev-charging";
import { cacheLife, cacheTag } from "next/cache";

export interface EvChargingSnapshot {
  /** ISO timestamp the feed reports for itself; `null` when unavailable. */
  observedAt: string | null;
  records: ConnectorRecord[];
}

const EMPTY: EvChargingSnapshot = { observedAt: null, records: [] };

/**
 * The current state of every public connector, straight from LTA DataMall's
 * five-minute batch file.
 *
 * Nothing is stored: every live figure on the site derives from this one
 * cached download. The built-in `max` profile puts the timer far enough out
 * to be a backstop: the `ev-charging-live` workflow busts the tag after each
 * ingest, and that is what refreshes these figures in practice. Mind
 * that this query feeds the homepage too, and the shortest cache life on a
 * route sets how often Vercel regenerates the whole page — which is why an
 * earlier one-minute profile burned the Hobby ISR-write and CPU quotas.
 * Without an account key the snapshot is empty and the pages show their
 * empty state.
 */
export async function getEvChargingSnapshot(): Promise<EvChargingSnapshot> {
  "use cache";
  cacheLife("max");
  cacheTag(EV_CHARGING_LIVE_CACHE_TAG);

  const accountKey = process.env.LTA_DATAMALL_ACCOUNT_KEY;
  if (!accountKey) {
    return EMPTY;
  }

  const payload = await fetchBatch(accountKey);
  return {
    observedAt: extractLastUpdated(payload)?.toISOString() ?? null,
    records: parseBatch(payload),
  };
}
