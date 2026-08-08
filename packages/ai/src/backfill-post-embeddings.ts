import {
  and,
  asc,
  count,
  db,
  eq,
  gt,
  isNotNull,
  isNull,
  posts,
} from "@motormetrics/database";
import { generateDocumentEmbedding } from "./embedding";

export interface BackfillPostEmbeddingsOptions {
  batchSize?: number;
  onProgress?: (message: string) => void;
}

export interface BackfillPostEmbeddingsResult {
  failed: number;
  processed: number;
  remaining: number;
  succeeded: number;
}

const DEFAULT_BATCH_SIZE = 25;

/**
 * Destructively clears legacy vectors before the Gemini 2 backfill.
 * Run this once, separately from the resumable backfill.
 */
export async function resetPostEmbeddings(): Promise<number> {
  const resetPosts = await db
    .update(posts)
    .set({ embedding: null })
    .where(isNotNull(posts.embedding))
    .returning({ id: posts.id });

  return resetPosts.length;
}

export async function backfillPostEmbeddings(
  options: BackfillPostEmbeddingsOptions = {},
): Promise<BackfillPostEmbeddingsResult> {
  const batchSize = options.batchSize ?? DEFAULT_BATCH_SIZE;
  const onProgress = options.onProgress ?? console.log;

  if (!Number.isInteger(batchSize) || batchSize < 1) {
    throw new Error("Embedding backfill batch size must be a positive integer");
  }

  let cursor: string | undefined;
  let failed = 0;
  let processed = 0;
  let succeeded = 0;

  while (true) {
    const batch = await db
      .select({
        id: posts.id,
        title: posts.title,
        excerpt: posts.excerpt,
        content: posts.content,
      })
      .from(posts)
      .where(
        cursor
          ? and(isNull(posts.embedding), gt(posts.id, cursor))
          : isNull(posts.embedding),
      )
      .orderBy(asc(posts.id))
      .limit(batchSize);

    if (batch.length === 0) {
      break;
    }

    for (const post of batch) {
      cursor = post.id;
      processed += 1;

      try {
        const embedding = await generateDocumentEmbedding(post);
        await db
          .update(posts)
          .set({ embedding })
          .where(and(eq(posts.id, post.id), isNull(posts.embedding)));
        succeeded += 1;
      } catch (error) {
        failed += 1;
        onProgress(
          `[EMBEDDING_BACKFILL] Failed post ${post.id}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    onProgress(
      `[EMBEDDING_BACKFILL] Processed ${processed}; succeeded ${succeeded}; failed ${failed}`,
    );
  }

  const [remainingResult] = await db
    .select({ value: count() })
    .from(posts)
    .where(isNull(posts.embedding));
  const remaining = remainingResult?.value ?? 0;

  return { failed, processed, remaining, succeeded };
}
