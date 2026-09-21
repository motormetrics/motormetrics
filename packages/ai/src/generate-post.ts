import { google } from "@ai-sdk/google";
import {
  gateway,
  generateText,
  isStepCount,
  type LanguageModelUsage,
  Output,
} from "ai";
import { type BlogGenerationParams, INSTRUCTIONS, PROMPTS } from "./config";
import {
  collectCategories,
  collectHighlights,
  renderPostContent,
} from "./render-post";
import { savePost } from "./save-post";
import { type GeneratedPost, postSchema } from "./schemas";

/**
 * Result of generating and saving a blog post
 */
export interface GenerateAndSaveResult {
  month: string;
  postId: string;
  title: string;
  slug: string;
  excerpt: string;
  dataType:
    | "cars"
    | "coe"
    | "deregistrations"
    | "electric-vehicles"
    | "pqp"
    | "monthly-update";
}

/**
 * Result of blog content generation
 */
export interface GenerateBlogContentResult {
  output: GeneratedPost;
  usage: LanguageModelUsage;
  response: {
    generationId?: string;
    id: string;
    modelId: string;
    timestamp: Date;
    totalCost?: number;
  };
}

/**
 * Internal: AI content generation.
 *
 * One call, structured output, no tools. Code execution used to be here so the
 * model could compute totals and shares, but it computed them wrong: both
 * gpt-5-mini and gpt-5.2 reported 4,001 registrations for a month whose rows
 * sum to 4,007, and quoted a make's all-fuel count inside a BEV section. Every
 * headline figure now arrives pre-computed from SQL (see
 * getMonthlyComputedFigures), so the model quotes rather than derives.
 *
 * Two calls, because Gemini rejects tools alongside a JSON response format
 * ("Tool use with a response mime type: 'application/json' is unsupported").
 * The AI SDK docs describe structured output as combinable with tools in one
 * generateText call, but the Google provider sets the JSON response format on
 * the first request — the one carrying the tools — so it is refused before
 * stopWhen can split anything. Verified against the live gateway.
 *
 * Call 1 drafts markdown with code execution available. Call 2 carries no
 * tools and only reshapes that draft into the schema. The shaping call is
 * told to copy figures verbatim, because its failure mode is restating a
 * number rather than inventing one.
 */
async function generateContent(
  options: BlogGenerationParams,
): Promise<GenerateBlogContentResult> {
  const { data, month, dataType } = options;

  console.log(`[GENERATE] ${dataType} blog generation started...`);

  const draft = await generateText({
    model: gateway("google/gemini-2.5-flash"),
    tools: {
      code_execution: google.tools.codeExecution({}),
    },
    stopWhen: isStepCount(10),
    instructions: INSTRUCTIONS[dataType],
    prompt: `Generate a blog post for ${dataType.toUpperCase()} data from ${month}:\n\n${data}\n\n${PROMPTS[dataType]}\n\nWrite the finished post as markdown in your final message.`,
    providerOptions: {
      google: {
        // Gemini 2.5's equivalent of reasoningEffort. thinkingLevel is 3.x+
        // only, which the free tier cannot reach. 0 disables thinking.
        thinkingConfig: { thinkingBudget: 8192, includeThoughts: false },
      },
    },
    telemetry: {
      functionId: `post-generation/${dataType}/draft`,
      includeRuntimeContext: { month: true, dataType: true, tags: true },
    },
    runtimeContext: {
      month,
      dataType,
      tags: [dataType, month, "post-generation"],
    },
  });

  const result = await generateText({
    model: gateway("google/gemini-2.5-flash"),
    output: Output.object({
      schema: postSchema,
    }),
    instructions: INSTRUCTIONS[dataType],
    prompt: `Convert this finished draft into the required structured fields.\n\nCopy every number exactly as it appears; do not recompute, re-round or invent any figure, and do not drop a vehicle category label. Keep the draft's wording — you are restructuring it, not rewriting it.\n\nOne exception: the title, every section heading and every chart title and subtitle must be SENTENCE CASE. If the draft Title Cased them, lower-case them here, keeping proper nouns. Tags stay Title Case.\n\n${draft.text}`,
    providerOptions: {
      google: {
        // Pure reformatting; it needs far less thinking than the draft.
        thinkingConfig: { thinkingBudget: 2048, includeThoughts: false },
      },
    },
    telemetry: {
      functionId: `post-generation/${dataType}/shape`,
      includeRuntimeContext: { month: true, dataType: true, tags: true },
    },
    runtimeContext: {
      month,
      dataType,
      tags: [dataType, month, "post-generation"],
    },
  });

  console.log(`[GENERATE] ${dataType} blog generation completed`);
  console.log(`[GENERATE] Draft steps: ${draft.steps?.length ?? 0}`);
  console.log(`[GENERATE] Finish reason: ${result.finishReason}`);
  console.log(`[GENERATE] Tool calls: ${draft.toolCalls?.length ?? 0}`);

  const { output, usage, finalStep, steps } = result;
  const { response } = finalStep;
  // Both calls, or the summed cost silently reports only the shaping call.
  const generationIds = collectGatewayGenerationIds({
    providerMetadata: finalStep.providerMetadata,
    steps: [...(draft.steps ?? []), ...(steps ?? [])],
  });
  const generationId =
    readGatewayGenerationId(finalStep.providerMetadata) ?? generationIds.at(-1);
  const totalCost = await sumGatewayGenerationCosts(generationIds);

  return {
    output,
    // Summed across both calls; `usage` alone is the shaping call only, which
    // would under-report the drafting call's tokens in the admin UI.
    usage: {
      ...usage,
      inputTokens: (draft.usage.inputTokens ?? 0) + (usage.inputTokens ?? 0),
      outputTokens: (draft.usage.outputTokens ?? 0) + (usage.outputTokens ?? 0),
      totalTokens: (draft.usage.totalTokens ?? 0) + (usage.totalTokens ?? 0),
    },
    response: {
      generationId,
      id: response.id,
      modelId: response.modelId,
      timestamp: response.timestamp,
      totalCost,
    },
  };
}

type GatewayProviderMetadata = {
  gateway?: {
    generationId?: unknown;
  };
};

function readGatewayGenerationId(
  providerMetadata: GatewayProviderMetadata | undefined,
): string | undefined {
  const generationId = providerMetadata?.gateway?.generationId;
  return typeof generationId === "string" ? generationId : undefined;
}

/**
 * Collect distinct Gateway generation IDs from every model step.
 * Top-level `providerMetadata` only reflects the final step when Code
 * Interpreter (or other tools) triggers multiple requests.
 */
function collectGatewayGenerationIds(result: {
  providerMetadata?: GatewayProviderMetadata;
  steps?: Array<{ providerMetadata?: GatewayProviderMetadata }>;
}): string[] {
  const generationIds = new Set<string>();

  for (const step of result.steps ?? []) {
    const stepGenerationId = readGatewayGenerationId(step.providerMetadata);
    if (stepGenerationId) {
      generationIds.add(stepGenerationId);
    }
  }

  const topLevelGenerationId = readGatewayGenerationId(result.providerMetadata);
  if (topLevelGenerationId) {
    generationIds.add(topLevelGenerationId);
  }

  return [...generationIds];
}

async function sumGatewayGenerationCosts(
  generationIds: string[],
): Promise<number | undefined> {
  if (generationIds.length === 0) {
    return undefined;
  }

  let totalCost = 0;

  for (const id of generationIds) {
    try {
      const generation = await gateway.getGenerationInfo({ id });
      totalCost += generation.totalCost;
    } catch (error) {
      console.error(
        "[GENERATE] Failed to retrieve Gateway generation cost:",
        error instanceof Error ? error.message : String(error),
      );
      // Omit cost entirely when any lookup fails so we never persist a
      // partial multi-step total that the admin UI would label as exact.
      return undefined;
    }
  }

  return totalCost;
}

async function saveGeneratedPost(
  options: BlogGenerationParams,
): Promise<GenerateAndSaveResult> {
  const { month, dataType } = options;

  const { output, usage, response } = await generateContent(options);

  console.log(`${dataType} blog post generated, saving to database...`);

  const post = await savePost({
    title: output.title,
    content: renderPostContent(output),
    excerpt: output.excerpt,
    heroImage: null,
    tags: output.tags,
    highlights: collectHighlights(output),
    month,
    dataType,
    responseMetadata: {
      responseId: response.id,
      generationId: response.generationId,
      modelId: response.modelId,
      timestamp: response.timestamp,
      totalCost: response.totalCost,
      usage,
      sections: output.sections,
      categories: collectCategories(output.sections),
    },
  });

  console.log(`${dataType} blog post saved successfully`);

  return {
    month,
    postId: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: output.excerpt,
    dataType,
  };
}

/**
 * Generates and saves a new blog post.
 *
 * When used within a WDK workflow, ensure `globalThis.fetch` is set to
 * the workflow's fetch function before calling this.
 */
export async function generateBlogContent(
  options: BlogGenerationParams,
): Promise<GenerateAndSaveResult> {
  return saveGeneratedPost(options);
}

/**
 * Regenerates and updates an existing blog post.
 *
 * When used within a WDK workflow, ensure `globalThis.fetch` is set to
 * the workflow's fetch function before calling this.
 */
export async function regenerateBlogContent(
  options: BlogGenerationParams,
): Promise<GenerateAndSaveResult> {
  return saveGeneratedPost(options);
}
