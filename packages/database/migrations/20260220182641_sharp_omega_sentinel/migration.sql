ALTER TABLE "posts" ADD COLUMN "embedding" vector(768);--> statement-breakpoint
CREATE INDEX "posts_embedding_index" ON "posts" USING hnsw ("embedding" vector_cosine_ops);