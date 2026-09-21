import { gateway, generateText, type LanguageModelUsage, Output } from "ai";
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
 * That is also why this is a single call. Gemini refuses tools alongside a
 * JSON response format ("Tool use with a response mime type:
 * 'application/json' is unsupported"), which previously forced a draft call
 * carrying the tools and a second call to reshape the draft into the schema.
 * With no tools left to carry, the draft call bought nothing and cost a second
 * round trip, a second set of tokens, and one more chance for a figure to be
 * restated wrong.
 */
async function generateContent(
  options: BlogGenerationParams,
): Promise<GenerateBlogContentResult> {
  const { data, month, dataType } = options;

  console.log(`[GENERATE] ${dataType} blog generation started...`);

  const result = await generateText({
    model: gateway("google/gemini-2.5-flash"),
    output: Output.object({
      schema: postSchema,
    }),
    instructions: INSTRUCTIONS[dataType],
    prompt: `Generate a blog post for ${dataType.toUpperCase()} data from ${month}:\n\n${data}\n\n${PROMPTS[dataType]}`,
    providerOptions: {
      google: {
        // Gemini 2.5's equivalent of reasoningEffort. thinkingLevel is 3.x+
        // only, which the free tier cannot reach. 0 disables thinking.
        thinkingConfig: { thinkingBudget: 8192, includeThoughts: false },
      },
    },
    telemetry: {
      functionId: `post-generation/${dataType}`,
      includeRuntimeContext: { month: true, dataType: true, tags: true },
    },
    runtimeContext: {
      month,
      dataType,
      tags: [dataType, month, "post-generation"],
    },
  });

  console.log(`[GENERATE] ${dataType} blog generation completed`);
  console.log(`[GENERATE] Finish reason: ${result.finishReason}`);

  const { output, usage, finalStep, steps } = result;
  const { response } = finalStep;
  const generationIds = collectGatewayGenerationIds({
    providerMetadata: finalStep.providerMetadata,
    steps,
  });
  const generationId =
    readGatewayGenerationId(finalStep.providerMetadata) ?? generationIds.at(-1);
  const totalCost = await sumGatewayGenerationCosts(generationIds);

  return {
    output,
    usage,
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
