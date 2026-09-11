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
 * cached download. The `hours` profile is deliberately coarser than the
 * feed's five-minute refresh: this query feeds the homepage, and the shortest
 * cache life on a route sets how often Vercel regenerates the whole page. A
 * one-minute profile burned the Hobby ISR-write and CPU quotas. Without an
 * account key the snapshot is empty and the pages show their empty state.
 */
export async function getEvChargingSnapshot(): Promise<EvChargingSnapshot> {
  "use cache";
  cacheLife("hours");

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
