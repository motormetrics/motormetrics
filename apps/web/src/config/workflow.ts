export const NEXT_PUBLIC_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL as string;

export const CACHE_TTL = 24 * 60 * 60;

export const WORKFLOW_TEMP_DIR = "/tmp";
export const LTA_DATAMALL_BASE_URL =
  "https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Vehicle Registration";

// Pins each workflow run's storage, queueing, and streams to Singapore. v5 already
// defaults to the compute region, so this only guarantees the pin survives a future
// change to `regions` in vercel.ts.
export const WORKFLOW_REGION = "sin1";
