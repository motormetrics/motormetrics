if (!process.env.DATABASE_URL?.trim()) {
  throw new Error(
    "DATABASE_URL is required to backfill post embeddings. Set it to your PostgreSQL connection string (see packages/ai/.env.example).",
  );
}

const { backfillPostEmbeddings } = await import(
  "../src/backfill-post-embeddings"
);

const batchSize = Number.parseInt(
  process.env.EMBEDDING_BACKFILL_BATCH_SIZE ?? "25",
  10,
);

const result = await backfillPostEmbeddings({ batchSize });

console.log("[EMBEDDING_BACKFILL] Complete", result);

if (result.failed > 0 || result.remaining > 0) {
  process.exitCode = 1;
}

export {};
