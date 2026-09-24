export const WORKFLOW_TEMP_DIR = "/tmp";
export const LTA_DATAMALL_BASE_URL =
  "https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration";

// Pins each workflow run's storage, queueing, and streams to Singapore. v5 already
// defaults to the compute region, so this only guarantees the pin survives a future
// change to `regions` in vercel.ts.
export const WORKFLOW_REGION = "sin1";

// Redis keys each data workflow stamps with the time of its last successful
// update. Kept here, rather than in the `@web/config` barrel, so workflows can
// import them without pulling UI dependencies into the workflow bundle.
export const LAST_UPDATED_CARS_KEY = "last_updated:cars";
export const LAST_UPDATED_COE_KEY = "last_updated:coe";
