import { resetPostEmbeddings } from "../src/backfill-post-embeddings";

const REQUIRED_CONFIRMATION = "replace-with-gemini-2";

if (process.env.CONFIRM_EMBEDDING_RESET !== REQUIRED_CONFIRMATION) {
  throw new Error(
    `Refusing to clear post embeddings. Set CONFIRM_EMBEDDING_RESET=${REQUIRED_CONFIRMATION} to confirm the destructive replacement.`,
  );
}

const resetCount = await resetPostEmbeddings();

console.log(`[EMBEDDING_RESET] Cleared ${resetCount} legacy post embeddings`);
