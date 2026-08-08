import { backfillPostEmbeddings } from "../src/backfill-post-embeddings";

const batchSize = Number.parseInt(
  process.env.EMBEDDING_BACKFILL_BATCH_SIZE ?? "25",
  10,
);

const result = await backfillPostEmbeddings({ batchSize });

console.log("[EMBEDDING_BACKFILL] Complete", result);

if (result.failed > 0 || result.remaining > 0) {
  process.exitCode = 1;
}
