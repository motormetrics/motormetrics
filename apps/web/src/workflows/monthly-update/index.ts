import { generateBlogContent } from "@motormetrics/ai/generate-post";
import {
  getCarsAggregatedByMonth,
  getCoeForMonth,
  getDeregistrationsForMonth,
  getLatestCompleteMonth,
  getMonthlyComputedFigures,
  getPqpForMonth,
  getPriorMonthsCarsSummary,
  getPriorMonthsCoeSummary,
  getPriorMonthsDeregistrationsSummary,
  getPriorMonthsPqpSummary,
} from "@motormetrics/ai/queries";
import { tokeniser } from "@motormetrics/utils/tokeniser";
import { getExistingPostByMonth } from "@web/queries/posts";
import {
  emitEvent,
  handleAIError,
  revalidatePostsCache,
} from "@web/workflows/shared";

interface MonthlyUpdatePayload {
  month?: string;
}

interface MonthlyUpdateResult {
  message: string;
  postId?: string;
}

/**
 * The monthly update: one post covering the whole month.
 *
 * Registrations, COE (both bidding exercises), PQP and deregistrations used to
 * produce a post each, which meant four posts a month competing for the same
 * Singapore car-market queries. This replaces them.
 *
 * It ingests nothing. The cars, COE and deregistrations workflows still own
 * their LTA ingest and run earlier in the day; this reads what they wrote,
 * which is why it waits for a month every dataset has published.
 */
export async function monthlyUpdateWorkflow(
  payload?: MonthlyUpdatePayload,
): Promise<MonthlyUpdateResult> {
  "use workflow";

  const month = payload?.month ?? (await resolveMonth());
  if (!month) {
    return { message: "[MONTHLY] No month with complete data yet." };
  }

  const existingPost = await checkExistingUpdate(month);
  if (existingPost) {
    return { message: `[MONTHLY] Post for ${month} already exists, skipping.` };
  }

  await emitEvent({ type: "step:start", step: "fetchMonthlyData" });
  const data = await fetchMonthlyData(month);
  await emitEvent({ type: "step:complete", step: "fetchMonthlyData" });

  await emitEvent({ type: "step:start", step: "generateMonthlyUpdate" });
  const post = await generateMonthlyUpdate(data, month);
  await emitEvent({
    type: "post:generated",
    step: "generateMonthlyUpdate",
    data: { postId: post.postId },
  });

  // Hero image generation is commented out while the prompts are being
  // iterated: every run would otherwise spend a gpt-image-2 call on a post
  // that is about to be regenerated. Restore before this goes near the cron —
  // uncommenting also needs `generatePostHero` added back to the import from
  // @web/workflows/shared above.
  // await emitEvent({ type: "step:start", step: "generateMonthlyHero" });
  // try {
  //   await generatePostHero({
  //     postId: post.postId,
  //     title: post.title,
  //     excerpt: post.excerpt,
  //     dataType: post.dataType,
  //   });
  //   await emitEvent({
  //     type: "step:complete",
  //     step: "generateMonthlyHero",
  //     data: { postId: post.postId },
  //   });
  // } catch (error) {
  //   console.error("[MONTHLY] Hero generation failed after retries:", error);
  //   await emitEvent({
  //     type: "step:complete",
  //     step: "generateMonthlyHero",
  //     data: { postId: post.postId, heroGenerated: false },
  //   });
  // }

  await revalidatePostsCache();

  return {
    message: `[MONTHLY] Published update for ${month}`,
    postId: post.postId,
  };
}

async function resolveMonth(): Promise<string | null> {
  "use step";
  return getLatestCompleteMonth();
}

async function checkExistingUpdate(month: string) {
  "use step";
  const [existingPost] = await getExistingPostByMonth(month, "monthly-update");
  return existingPost ?? null;
}

async function fetchMonthlyData(month: string) {
  "use step";

  const [
    computed,
    cars,
    coe,
    pqp,
    deregistrations,
    priorCars,
    priorCoe,
    priorPqp,
    priorDeregistrations,
  ] = await Promise.all([
    getMonthlyComputedFigures(month),
    getCarsAggregatedByMonth(month),
    getCoeForMonth(month),
    getPqpForMonth(month),
    getDeregistrationsForMonth(month),
    getPriorMonthsCarsSummary(month),
    getPriorMonthsCoeSummary(month),
    getPriorMonthsPqpSummary(month),
    getPriorMonthsDeregistrationsSummary(month),
  ]);

  // One labelled block per dataset. The prompt reads these by name, so the
  // labels are part of the contract, not formatting.
  //
  // COMPUTED FIGURES leads because it outranks everything under it: the raw
  // rows are there for detail the block does not carry, not for the model to
  // re-add into a headline of its own.
  return [
    formatComputedFigures(computed),
    `PRIOR MONTHS REGISTRATIONS\n${tokeniser(priorCars)}`,
    `PRIOR MONTHS COE\n${tokeniser(priorCoe)}`,
    `PRIOR MONTHS PQP\n${tokeniser(priorPqp)}`,
    `PRIOR MONTHS DEREGISTRATIONS\n${tokeniser(priorDeregistrations)}`,
    `THIS MONTH REGISTRATIONS\n${tokeniser(cars)}`,
    `THIS MONTH COE\n${tokeniser(coe)}`,
    `THIS MONTH PQP\n${tokeniser(pqp)}`,
    `THIS MONTH DEREGISTRATIONS\n${tokeniser(deregistrations)}`,
  ].join("\n\n");
}

/**
 * Renders the pre-computed figures as one labelled block.
 *
 * Scalars become `name: value` lines and the breakdowns become their own
 * sub-labelled tables, in the same pipe-delimited form as the raw datasets, so
 * the prompt reads one format throughout. Field names are the contract with
 * the prompt — every share names its denominator — so nothing here renames or
 * reorders them.
 */
function formatComputedFigures(
  figures: Awaited<ReturnType<typeof getMonthlyComputedFigures>>,
): string {
  const lines: string[] = [];
  const tables: string[] = [];

  for (const [name, value] of Object.entries(figures)) {
    if (value === undefined || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      tables.push(`COMPUTED FIGURES / ${name}\n${tokeniser(value)}`);
      continue;
    }
    lines.push(`${name}: ${value}`);
  }

  return [`COMPUTED FIGURES\n${lines.join("\n")}`, ...tables].join("\n\n");
}

async function generateMonthlyUpdate(data: string, month: string) {
  "use step";

  try {
    return await generateBlogContent({
      data,
      month,
      dataType: "monthly-update",
    });
  } catch (error) {
    handleAIError(error);
  }
}
