# MotorMetrics AI Package

## Code Execution Tool

The **critical feature** that prevents hallucinations:

```typescript
model: gateway("openai/gpt-5.6-luna"),
tools: { code_interpreter: openai.tools.codeInterpreter({}) },
providerOptions: { openai: { reasoningEffort: "max" } }
```

**Why It Matters:**
- Allows GPT-5.6 Luna to execute Python code to analyse data
- Performs accurate calculations (totals, percentages, aggregations)
- Verifies data formatting before generating structured output
- Eliminates guesswork and hallucinated numbers

**In Single-Call Flow:**
- Combined with `output: Output.object({ schema: postSchema })`
- `stopWhen: stepCountIs(10)` ensures tool execution completes before structured output
- Single API call handles both Code Execution and validated generation

## Langfuse Telemetry

**Trace Metadata:**
- `functionId`: `post-generation/cars` or `post-generation/coe`
- `month`: Data month being processed
- `dataType`: Either "cars" or "coe"
- `tags`: [dataType, month, "post-generation"]

Call `shutdownTracing()` in a `finally` block after generation so pending spans are
flushed before the process or request ends.

Gateway generation IDs are collected from every `result.steps[]` entry (plus
top-level / final-step provider metadata) and looked up with
`gateway.getGenerationInfo()` so multi-step Code Interpreter runs sum into the
exact billed `totalCost` only when every lookup succeeds. Any failed lookup
omits `totalCost` while still saving the post.

## Post Persistence

`savePost()` is idempotent: the insert targets the `month` + `dataType` unique
constraint with `onConflictDoUpdate`, so re-running a generation for the same month
overwrites the existing post rather than creating a duplicate. Slug generation and
cache tag revalidation happen as part of the save.

## Workflow Integration (Vercel WDK)

When calling AI functions inside a Vercel WDK workflow, set `globalThis.fetch = fetch`
(from the `workflow` package) before the call to enable durable fetch with automatic
retries.

## Environment Variables

**Required:**
- `AI_GATEWAY_API_KEY`: Vercel AI Gateway API key
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for hero-image upload (injected
  automatically on Vercel when a Blob store is linked; required locally)

Blog generation, embeddings, and hero-image generation all use the Gateway
credential. Hero-image upload additionally needs Blob access. Do not add
provider-specific API keys.

## Embeddings and in-place replacement

- Documents use `generateDocumentEmbedding()` with
  `title: … | text: …`.
- Queries use `generateQueryEmbedding()` with
  `task: search result | query: …`.
- Both use `google/gemini-embedding-2` through Gateway and return 768 dimensions.
- Existing `posts.embedding` vectors are replaced in place; no schema migration
  is needed because the dimension remains 768.
- Pause post writes and semantic features, then run the guarded one-time reset:
  `CONFIRM_EMBEDDING_RESET=replace-with-gemini-2 pnpm --filter @motormetrics/ai reset:embeddings`.
- Run `pnpm --filter @motormetrics/ai backfill:embeddings` until it reports zero
  remaining posts. The backfill only writes null rows, so it is resumable and
  idempotent after the reset.
- Never rerun the reset once backfilling has started.

**Optional (for telemetry):**
- `LANGFUSE_PUBLIC_KEY`: Langfuse public key
- `LANGFUSE_SECRET_KEY`: Langfuse secret key
- `LANGFUSE_HOST`: Langfuse host URL (defaults to https://cloud.langfuse.com)

## Related Documentation

- **Workflow Integration**: See [apps/web/CLAUDE.md](../../apps/web/CLAUDE.md) for Vercel WDK workflow usage
- **Admin Interface**: Admin functionality is integrated into the web app at `/admin` path
- **Database Schema**: See [packages/database/CLAUDE.md](../database/CLAUDE.md) for posts table structure
