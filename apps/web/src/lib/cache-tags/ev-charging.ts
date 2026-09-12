/** Every EV charging query shares one tag; the source refreshes quarterly. */
export const EV_CHARGING_CACHE_TAG = "ev-charging";

/**
 * The live availability feed, refreshed by the `ev-charging-live` workflow.
 *
 * Separate from the quarterly registry tag: these reads are busted on every
 * ingest rather than waiting out a cache profile.
 */
export const EV_CHARGING_LIVE_CACHE_TAG = "ev-charging:live";
