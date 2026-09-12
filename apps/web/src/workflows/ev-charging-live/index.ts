import { EV_CHARGING_LIVE_CACHE_TAG } from "@web/lib/cache-tags";
import {
  type IngestResult,
  ingestLiveSnapshot,
} from "@web/workflows/ev-charging-live/steps/ingest";
import { emitEvent } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";

/**
 * Live EV charger availability workflow using Vercel WDK.
 *
 * Runs every five minutes against LTA DataMall's EV Charging Points Batch
 * API and records the current state of every connector, the transitions
 * since the last run, and per-location hourly utilisation counters.
 *
 * Reads served from this data are cached under `EV_CHARGING_LIVE_CACHE_TAG`
 * on the built-in `max` profile, whose timer is only a backstop: this
 * workflow busts the tag once the ingest lands, so a read regenerates when
 * the numbers actually change rather than on a guess at the feed's cadence.
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

  // Either way nothing was written, so there is nothing to revalidate.
  if (result.skipped === "missing-account-key") {
    return {
      message:
        "[EV CHARGING LIVE] LTA_DATAMALL_ACCOUNT_KEY is not set. Skipped.",
    };
  }
  if (result.skipped === "already-ingested") {
    return {
      message: `[EV CHARGING LIVE] Batch at ${result.observedAt} is already stored. Skipped.`,
    };
  }

  await emitEvent({
    type: "step:start",
    step: "revalidateEvChargingLiveCache",
  });
  await revalidateEvChargingLiveCache();
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateEvChargingLiveCache",
  });

  return {
    message: `[EV CHARGING LIVE] ${result.connectors} connectors across ${result.locations} locations, ${result.events} changes at ${result.observedAt}`,
  };
}

async function revalidateEvChargingLiveCache(): Promise<void> {
  "use step";
  revalidateTag(EV_CHARGING_LIVE_CACHE_TAG, "max");
}

async function ingestSnapshot(): Promise<IngestResult> {
  "use step";
  return ingestLiveSnapshot();
}
