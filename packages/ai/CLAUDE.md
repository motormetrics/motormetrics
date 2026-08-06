# MotorMetrics AI Package

## Code Execution Tool

The **critical feature** that prevents hallucinations:

```typescript
tools: { code_execution: google.tools.codeExecution({}) }
```

**Why It Matters:**
- Allows Gemini to execute Python code to analyse data
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
- `GOOGLE_GENERATIVE_AI_API_KEY`: Google Gemini API key

**Optional (for telemetry):**
- `LANGFUSE_PUBLIC_KEY`: Langfuse public key
- `LANGFUSE_SECRET_KEY`: Langfuse secret key
- `LANGFUSE_HOST`: Langfuse host URL (defaults to https://cloud.langfuse.com)

## Related Documentation

- **Workflow Integration**: See [apps/web/CLAUDE.md](../../apps/web/CLAUDE.md) for Vercel WDK workflow usage
- **Admin Interface**: Admin functionality is integrated into the web app at `/admin` path
- **Database Schema**: See [packages/database/CLAUDE.md](../database/CLAUDE.md) for posts table structure
