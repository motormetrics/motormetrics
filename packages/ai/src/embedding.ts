import { embed, gateway } from "ai";

export const POST_EMBEDDING_MODEL_ID = "google/gemini-embedding-2";
export const POST_EMBEDDING_DIMENSIONS = 768;

const MAX_EMBEDDING_CONTENT_LENGTH = 2000;

export interface PostEmbeddingInput {
  title: string;
  excerpt?: string | null;
  content: string;
}

export function formatDocumentForEmbedding(post: PostEmbeddingInput): string {
  const textParts: string[] = [];

  if (post.excerpt) {
    textParts.push(post.excerpt.trim());
  }

  textParts.push(post.content.trim().slice(0, MAX_EMBEDDING_CONTENT_LENGTH));

  return `title: ${post.title.trim()} | text: ${textParts.join("\n\n")}`;
}

export function formatQueryForEmbedding(query: string): string {
  return `task: search result | query: ${query.trim()}`;
}

async function generateEmbedding(
  value: string,
  functionId: "post-document-embedding" | "post-query-embedding",
): Promise<number[]> {
  const { embedding } = await embed({
    model: gateway.embeddingModel(POST_EMBEDDING_MODEL_ID),
    value,
    providerOptions: {
      google: { outputDimensionality: POST_EMBEDDING_DIMENSIONS },
    },
    telemetry: {
      functionId,
    },
  });

  if (embedding.length !== POST_EMBEDDING_DIMENSIONS) {
    throw new Error(
      `Expected a ${POST_EMBEDDING_DIMENSIONS}-dimensional embedding, received ${embedding.length}`,
    );
  }

  return embedding;
}

export async function generateDocumentEmbedding(
  post: PostEmbeddingInput,
): Promise<number[]> {
  return generateEmbedding(
    formatDocumentForEmbedding(post),
    "post-document-embedding",
  );
}

export async function generateQueryEmbedding(query: string): Promise<number[]> {
  return generateEmbedding(
    formatQueryForEmbedding(query),
    "post-query-embedding",
  );
}
