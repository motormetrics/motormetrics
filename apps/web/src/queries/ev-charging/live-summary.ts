import { inDistrict } from "./locations";
import { getEvChargingSnapshot } from "./snapshot";

export interface EvChargingLiveSummary {
  connectors: number;
  locations: number;
  available: number;
  occupied: number;
  unavailable: number;
  /** ISO timestamp of the batch the figures come from. */
  observedAt: string | null;
}

/** Connector state at the latest batch, island-wide or for one district. */
export async function getEvChargingLiveSummary(
  district?: string,
): Promise<EvChargingLiveSummary> {
  const { observedAt, records } = await getEvChargingSnapshot();
  const summary: EvChargingLiveSummary = {
    connectors: 0,
    locations: 0,
    available: 0,
    occupied: 0,
    unavailable: 0,
    observedAt,
  };
  const locations = new Set<string>();

  for (const record of records) {
    if (!inDistrict(record.postalCode, district)) {
      continue;
    }
    summary.connectors += 1;
    summary[record.status] += 1;
    locations.add(record.locationId);
  }

  summary.locations = locations.size;
  return summary;
}
