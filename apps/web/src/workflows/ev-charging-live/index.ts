import {
  type IngestResult,
  ingestLiveSnapshot,
} from "@web/workflows/ev-charging-live/steps/ingest";
import { emitEvent } from "@web/workflows/shared";

/**
 * Live EV charger availability workflow using Vercel WDK.
 *
 * Runs every five minutes against LTA DataMall's EV Charging Points Batch
 * API and records the current state of every connector, the transitions
 * since the last run, and per-location hourly utilisation counters.
 *
 * Reads served from these tables use short cache profiles rather than tag
 * revalidation, since the data changes on every run by design.
 */
export async function evChargingLiveWorkflow(): Promise<{ message: string }> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "ingestEvChargingLive" });
  const result = await ingestSnapshot();
  await emitEvent({
    type: "data:processed",
    step: "ingestEvChargingLive",
    data: { recordsProcessed: result.connectors },
  });

  if (result.skipped) {
    return {
      message:
        "[EV CHARGING LIVE] LTA_DATAMALL_ACCOUNT_KEY is not set. Skipped.",
    };
  }

  return {
    message: `[EV CHARGING LIVE] ${result.connectors} connectors across ${result.locations} locations, ${result.events} changes at ${result.observedAt}`,
  };
}

async function ingestSnapshot(): Promise<IngestResult> {
  "use step";
  return ingestLiveSnapshot();
}
