import { openai } from "@ai-sdk/openai";
import {
  gateway,
  generateText,
  type LanguageModelUsage,
  Output,
  stepCountIs,
} from "ai";
import { type BlogGenerationParams, INSTRUCTIONS, PROMPTS } from "./config";
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
  dataType: "cars" | "coe" | "deregistrations" | "electric-vehicles";
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
 * Uses a single call with both code execution (tools) and structured output for accuracy and type-safety.
 */
async function generateContent(
  options: BlogGenerationParams,
): Promise<GenerateBlogContentResult> {
  const { data, month, dataType } = options;

  console.log(`[GENERATE] ${dataType} blog generation started...`);

  const result = await generateText({
    model: gateway("openai/gpt-5.6-luna"),
    tools: {
      code_interpreter: openai.tools.codeInterpreter({}),
    },
    output: Output.object({
      schema: postSchema,
    }),
    stopWhen: stepCountIs(10),
    system: INSTRUCTIONS[dataType],
    prompt: `Generate a blog post for ${dataType.toUpperCase()} data from ${month}:\n\n${data}\n\n${PROMPTS[dataType]}`,
    providerOptions: {
      openai: {
        reasoningEffort: "max",
      },
    },
    experimental_telemetry: {
      isEnabled: true,
      functionId: `post-generation/${dataType}`,
      metadata: {
        month,
        dataType,
        tags: [dataType, month, "post-generation"],
      },
    },
  });

  console.log(`[GENERATE] ${dataType} blog generation completed`);
  console.log(`[GENERATE] Steps: ${result.steps?.length ?? 0}`);
  console.log(`[GENERATE] Finish reason: ${result.finishReason}`);
  console.log(`[GENERATE] Tool calls: ${result.toolCalls?.length ?? 0}`);

  const { output, usage, response } = result;
  const generationIds = collectGatewayGenerationIds(result);
  const generationId =
    readGatewayGenerationId(result.providerMetadata) ?? generationIds.at(-1);
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
  let retrievedCost = false;

  for (const id of generationIds) {
    try {
      const generation = await gateway.getGenerationInfo({ id });
      totalCost += generation.totalCost;
      retrievedCost = true;
    } catch (error) {
      console.error(
        "[GENERATE] Failed to retrieve Gateway generation cost:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  return retrievedCost ? totalCost : undefined;
}

async function saveGeneratedPost(
  options: BlogGenerationParams,
): Promise<GenerateAndSaveResult> {
  const { month, dataType } = options;

  const { output, usage, response } = await generateContent(options);

  console.log(`${dataType} blog post generated, saving to database...`);

  const post = await savePost({
    title: output.title,
    content: output.content,
    excerpt: output.excerpt,
    heroImage: null,
    tags: output.tags,
    highlights: output.highlights,
    month,
    dataType,
    responseMetadata: {
      responseId: response.id,
      generationId: response.generationId,
      modelId: response.modelId,
      timestamp: response.timestamp,
      totalCost: response.totalCost,
      usage,
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
