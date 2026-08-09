# @motormetrics/ai

AI-powered blog generation, embeddings, and hero images for MotorMetrics. All
provider traffic is routed through Vercel AI Gateway.

## Models

| Workload | Gateway model |
| --- | --- |
| Blog generation | `openai/gpt-5.6-luna` |
| Post and query embeddings | `google/gemini-embedding-2` |
| Hero images | `openai/gpt-image-2` |

Blog generation uses `max` reasoning, OpenAI Code Interpreter, the existing Zod
post schema, and Langfuse telemetry. Distinct Gateway generation IDs across all
model steps are looked up and summed into the exact billed cost when available.
Gemini 2 embeddings use 768 dimensions.

## Usage

### Generate and save a post

```typescript
import { generateBlogContent, shutdownTracing } from "@motormetrics/ai";

try {
  const post = await generateBlogContent({
    data: tokenisedData,
    month: "October 2024",
    dataType: "cars",
  });

  console.log(post.postId, post.title, post.slug);
} finally {
  await shutdownTracing();
}
```

`generateBlogContent()` and `regenerateBlogContent()` keep the same public
signature and both persist the generated post. Persistence is idempotent for a
given `month` and `dataType`.

When called from a Vercel WDK workflow, assign WDK's durable fetch before making
the AI call:

```typescript
import { fetch } from "workflow";

globalThis.fetch = fetch;
```

### Generate embeddings

```typescript
import {
  generateDocumentEmbedding,
  generateQueryEmbedding,
} from "@motormetrics/ai";

const documentEmbedding = await generateDocumentEmbedding({
  title: post.title,
  content: post.content,
});

const queryEmbedding = await generateQueryEmbedding("electric car trends");
```

Document inputs are formatted as `title: … | text: …`. Query inputs are
formatted as `task: search result | query: …`; this distinction is required by
Gemini Embedding 2 for retrieval quality.

Embedding failures remain non-fatal in post create/update and search flows, so
keyword search and post persistence can continue gracefully.

## Environment variables

Required:

```bash
AI_GATEWAY_API_KEY=
```

Optional Langfuse observability:

```bash
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=https://cloud.langfuse.com
```

No direct provider API key is required.

## Embedding migration rollout

Gemini Embedding 2 vectors are incompatible with legacy Gemini Embedding 001
vectors, even though both are stored at 768 dimensions. This migration replaces
the existing `posts.embedding` values in place and requires a short semantic
search maintenance window.

1. Pause blog generation, admin post edits, semantic search, and related-post
   ranking.
2. Clear the legacy vectors once:

   ```bash
   CONFIRM_EMBEDDING_RESET=replace-with-gemini-2 \
     pnpm --filter @motormetrics/ai reset:embeddings
   ```

   This is intentionally destructive and must not be repeated after backfilling
   has started.
3. Backfill existing posts with Gemini 2 vectors:

   ```bash
   pnpm --filter @motormetrics/ai backfill:embeddings
   ```

   Set `EMBEDDING_BACKFILL_BATCH_SIZE` to change the default batch size of 25.
   The job updates only rows where `embedding` is null, so it is resumable and
   idempotent after the one-time reset.
4. Confirm the command reports `remaining: 0`, deploy the Gemini 2 release, and
   resume post writes and semantic features.

No database schema migration is required because both models use 768 dimensions.

## Development

```bash
pnpm --filter @motormetrics/ai test
pnpm --filter @motormetrics/ai typecheck
```

Key dependencies are `ai`, `@ai-sdk/gateway`, `@ai-sdk/openai`, Langfuse, and
the MotorMetrics database and utility packages.

## License

MIT
