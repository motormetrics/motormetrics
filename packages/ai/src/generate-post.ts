import {
  createGoogleGenerativeAI,
  type GoogleGenerativeAIProviderOptions,
} from "@ai-sdk/google";
import { generateText, type LanguageModelUsage, Output, stepCountIs } from "ai";
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
    id: string;
    modelId: string;
    timestamp: Date;
  };
}

/**
 * Create the Google Generative AI provider.
 *
 * When used within a WDK workflow, set `globalThis.fetch = fetch` (from "workflow")
 * before calling these functions to enable WDK's durable fetch with automatic retries.
 */
const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

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
    model: google("gemini-3-flash-preview"),
    tools: {
      code_execution: google.tools.codeExecution({}),
    },
    output: Output.object({
      schema: postSchema,
    }),
    stopWhen: stepCountIs(10),
    system: INSTRUCTIONS[dataType],
    prompt: `Generate a blog post for ${dataType.toUpperCase()} data from ${month}:\n\n${data}\n\n${PROMPTS[dataType]}`,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingLevel: "medium",
          includeThoughts: true,
        },
      } satisfies GoogleGenerativeAIProviderOptions,
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

  return {
    output,
    usage,
    response: {
      id: response.id,
      modelId: response.modelId,
      timestamp: response.timestamp,
    },
  };
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
      modelId: response.modelId,
      timestamp: response.timestamp,
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
