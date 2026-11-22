import { redis } from "@motormetrics/utils/redis";
import { LAST_UPDATED_COE_KEY } from "@web/config/workflow";
import { getCoeMonthlyRevalidationTags } from "@web/lib/cache-tags";
import {
  type ClosingResults,
  ClosingResultsParseError,
  parseClosingResults,
} from "@web/workflows/coe-interim-results/steps/parse";
import { reportParseFailure } from "@web/workflows/coe-interim-results/steps/report";
import { storeInterimResults } from "@web/workflows/coe-interim-results/steps/store";
import { emitEvent } from "@web/workflows/shared";
import { revalidateTag } from "next/cache";
import { FatalError } from "workflow";

/** The OneMotoring page the closing results are read from. */
const COE_OPEN_BIDDING_URL =
  "https://onemotoring.lta.gov.sg/content/onemotoring/home/buying/coe-open-bidding.html";

interface CoeInterimResultsWorkflowResult {
  message: string;
}

/**
 * Same-day COE results workflow using Vercel WDK.
 *
 * Runs from a QStash schedule on weekday afternoons. When the OneMotoring page
 * shows an exercise that closed today, it stores the results in
 * `coe_interim_results` until `coeWorkflow` loads the DataMall CSV the next
 * day and evicts them. On any other day the page shows an older exercise and
 * the run is a no-op.
 */
export async function coeInterimResultsWorkflow(): Promise<CoeInterimResultsWorkflowResult> {
  "use workflow";

  await emitEvent({ type: "step:start", step: "readClosingResults" });
  const closing = await readClosingResults();

  if (closing.status === "not-ended") {
    return { message: "[COE INTERIM] No exercise has closed. Skipped." };
  }
  if (closing.status === "stale") {
    return {
      message: `[COE INTERIM] Latest exercise closed on ${closing.endedOn}, not today. Skipped.`,
    };
  }

  const { month, biddingNo, results } = closing;
  await emitEvent({ type: "step:start", step: "storeInterimResults" });
  const inserted = await storeResults(month, biddingNo, results);
  await emitEvent({
    type: "data:processed",
    step: "storeInterimResults",
    data: { recordsProcessed: inserted },
  });

  if (inserted === 0) {
    return {
      message: `[COE INTERIM] ${month} exercise ${biddingNo} is already stored. Skipped.`,
    };
  }

  await emitEvent({ type: "step:start", step: "revalidateCoeCache" });
  await revalidateCoeCache(month);
  await emitEvent({
    type: "cache:revalidated",
    step: "revalidateCoeCache",
    data: { month },
  });

  // Its own step, after the revalidation: a failed Redis write retries alone.
  // Open COE pages wait for this stamp (via /api/coe/live) before refreshing,
  // so it must only land once the fresh results can be served.
  await stampLastUpdated();

  return {
    message: `[COE INTERIM] Stored ${inserted} results for ${month} exercise ${biddingNo}`,
  };
}

/** Today's date in Singapore, as `YYYY-MM-DD`. */
const todayInSingapore = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore" }).format(
    new Date(),
  );

async function readClosingResults(): Promise<ClosingResults> {
  "use step";

  // A network error or non-200 throws a plain Error, so the step retries.
  const response = await fetch(COE_OPEN_BIDDING_URL, {
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(
      `[COE INTERIM] OneMotoring returned HTTP ${response.status}`,
    );
  }
  const html = await response.text();

  try {
    return parseClosingResults(html, todayInSingapore());
  } catch (error) {
    if (error instanceof ClosingResultsParseError) {
      await reportParseFailure(error.check, error.message);
      // Retrying would only re-read the same page, so fail the run outright.
      throw new FatalError(`[COE INTERIM] ${error.message}`);
    }
    throw error;
  }
}

async function storeResults(
  month: string,
  biddingNo: number,
  results: Extract<ClosingResults, { status: "closed" }>["results"],
): Promise<number> {
  "use step";

  return storeInterimResults(month, biddingNo, results);
}

async function stampLastUpdated(): Promise<void> {
  "use step";

  await redis.set(LAST_UPDATED_COE_KEY, Date.now());
}

async function revalidateCoeCache(month: string): Promise<void> {
  "use step";

  // Expire outright rather than "max": open pages refresh straight after this
  // run, and stale-while-revalidate would serve them the old results.
  for (const tag of getCoeMonthlyRevalidationTags(month)) {
    revalidateTag(tag, { expire: 0 });
  }
}
