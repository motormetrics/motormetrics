# @motormetrics/ai

AI-powered blog generation, embeddings, and hero images for MotorMetrics. All
provider traffic is routed through Vercel AI Gateway.

## Models

| Workload | Gateway model |
| --- | --- |
| Blog generation | `google/gemini-2.5-flash` |
| Post and query embeddings | `google/gemini-embedding-2` |
| Hero images | `openai/gpt-image-2` |

Blog generation validates structured output against the Zod post schema. The
monthly workflow supplies pre-computed figures for the model to quote.
Embeddings use 768 dimensions.

## Usage

### Generate and save a post

```typescript
import { generateBlogContent } from "@motormetrics/ai/generate-post";

const post = await generateBlogContent({
  data: tokenisedData,
  month: "2024-10",
  dataType: "monthly-update",
});

console.log(post.postId, post.title, post.slug);
```

`generateBlogContent()` and `regenerateBlogContent()` both persist the generated post. Persistence is idempotent for a
given `month` and `dataType`.

The current web workflow generates one `monthly-update` post once registrations,
COE, PQP and deregistrations are available for the same month. Other supported
data types remain available for existing content. Regeneration preserves the
saved post's slug. Hero images are generated separately; the monthly workflow's
hero-image step is currently disabled.

When called from a Vercel WDK workflow, assign WDK's durable fetch before making
the AI call:

```typescript
import { fetch } from "workflow";

globalThis.fetch = fetch;
```

### Generate embeddings

`generateBlogContent()` returns metadata (`postId`, `title`, `slug`, `excerpt`)
after saving; it does not include `content`. Pass a saved post (or any object
with `title` and `content`) into the document embedding helper:

```typescript
import {
  generateDocumentEmbedding,
  generateQueryEmbedding,
} from "@motormetrics/ai/embedding";

const documentEmbedding = await generateDocumentEmbedding({
  title: savedPost.title,
  excerpt: savedPost.excerpt,
  content: savedPost.content,
});

const queryEmbedding = await generateQueryEmbedding("electric car trends");
```

Document inputs include the optional excerpt and the first 2,000 characters of
content, formatted as `title: … | text: …`. Query inputs are
formatted as `task: search result | query: …`; this distinction is required by
Gemini Embedding 2 for retrieval quality.

Embedding failures remain non-fatal in post create/update and search flows, so
keyword search and post persistence can continue gracefully.

## Environment variables

Required:

```bash
AI_GATEWAY_API_KEY=
DATABASE_URL=
```

`generateBlogContent()` / `regenerateBlogContent()` import the Neon client and
call `savePost()`, so `DATABASE_URL` is required for the generate-and-save flow
outside an already configured web deployment.

Hero-image upload requires Blob authentication. Vercel-linked environments use
`BLOB_STORE_ID` and `VERCEL_OIDC_TOKEN`; standalone scripts can alternatively use:

```bash
BLOB_READ_WRITE_TOKEN=
```

`generateHeroImage()` uploads via `@vercel/blob` and returns the image URL and
pathname. It does not update a post itself; the workflow calls
`updatePostHeroImage()` separately. See the [Blob authentication reference](https://github.com/vercel/storage/blob/main/_autodocs/configuration.md).

Set `NEXT_PUBLIC_SITE_URL` and `REVALIDATE_TOKEN` to request web cache invalidation
after saving a post. Without the token, this invalidation is skipped. Export
credentials into the process environment for standalone package scripts;
the scripts do not automatically load the web application's `.env.local`.

No direct provider API key is required.

## Replacing Legacy Embeddings

Gemini Embedding 2 vectors are incompatible with legacy Gemini Embedding 001
vectors, even though both are stored at 768 dimensions. This migration replaces
the existing `posts.embedding` values in place and requires a short semantic
search maintenance window. This procedure is only needed for databases that
still contain legacy vectors; normal setup does not require a reset.

Prerequisites: export `DATABASE_URL` (PostgreSQL) and `AI_GATEWAY_API_KEY`
before running either migration command. Both scripts fail fast with a clear
error if `DATABASE_URL` is missing.

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
4. Confirm the command reports `failed: 0` and `remaining: 0`, then resume post
   writes and semantic features using the Gemini 2 model.

No database schema migration is required because both models use 768 dimensions.

## Development

```bash
pnpm --filter @motormetrics/ai test
pnpm --filter @motormetrics/ai typecheck
```

Run these commands from the repository root after installing dependencies with
pnpm. Use the Node.js and pnpm versions in the [root manifest](../../package.json).
Public entry points and dependencies are listed in the [package manifest](package.json).

## License

[MIT](../../LICENSE)
