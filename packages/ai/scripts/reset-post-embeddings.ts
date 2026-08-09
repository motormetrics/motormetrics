const REQUIRED_CONFIRMATION = "replace-with-gemini-2";

if (process.env.CONFIRM_EMBEDDING_RESET !== REQUIRED_CONFIRMATION) {
  throw new Error(
    `Refusing to clear post embeddings. Set CONFIRM_EMBEDDING_RESET=${REQUIRED_CONFIRMATION} to confirm the destructive replacement.`,
  );
}

if (!process.env.DATABASE_URL?.trim()) {
  throw new Error(
    "DATABASE_URL is required to reset post embeddings. Set it to your PostgreSQL connection string (see packages/ai/.env.example).",
  );
}

const { resetPostEmbeddings } = await import("../src/backfill-post-embeddings");

const resetCount = await resetPostEmbeddings();

console.log(`[EMBEDDING_RESET] Cleared ${resetCount} legacy post embeddings`);

export {};
