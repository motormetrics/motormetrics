import {
  type ConnectorRecord,
  extractLastUpdated,
  fetchBatch,
  parseBatch,
} from "@web/lib/ev-charging";
import { cacheLife } from "next/cache";

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
 * cached download. The built-in `minutes` profile matches the feed's own
 * refresh rate, so a visitor sees at most a few minutes of staleness. Without
 * an account key the snapshot is empty and the pages show their empty state.
 */
export async function getEvChargingSnapshot(): Promise<EvChargingSnapshot> {
  "use cache";
  cacheLife("minutes");

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
