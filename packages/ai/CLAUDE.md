# MotorMetrics AI Package

## Overview

The `@motormetrics/ai` package provides AI-powered blog post generation for the MotorMetrics platform. It uses Vercel AI SDK with Google Gemini to analyse car registration and COE bidding data, generating accurate, SEO-optimised blog posts with structured output validation.

**Key Features:**
- **Single-Call Generation**: Combined tool calling (Code Execution) + structured output in one API call
- **Structured Output**: Zod-validated `postSchema` ensures consistent title, excerpt, content, tags, and highlights
- **Code Execution Tool**: Allows Gemini to execute Python code for accurate data analysis and calculations
- **Hero Images**: Singapore-focused Unsplash images for contextual blog post headers
- **Tag Constants**: Predefined vocabulary for consistent categorisation (`CARS_TAGS`, `COE_TAGS`)
- **Langfuse Telemetry**: Full observability with token usage tracking, cost analysis, and performance monitoring
- **Idempotent Post Saving**: Prevents duplicate posts with conflict handling
- **Shared Logic**: Single source of truth for blog generation used by Vercel WDK workflows and Admin app

## Package Structure

```
packages/ai/
├── src/
│   ├── index.ts                 # Package exports
│   ├── generate-post.ts         # Core blog generation with combined tool calling + structured output
│   ├── config.ts                # System instructions and prompts (INSTRUCTIONS, PROMPTS)
│   ├── schemas.ts               # Zod schemas for structured output (postSchema, highlightSchema)
│   ├── tags.ts                  # Tag constants and types (CARS_TAGS, COE_TAGS)
│   ├── hero-images.ts           # Hero image URLs and helpers
│   ├── queries.ts               # Database queries for data aggregation
│   ├── save-post.ts             # Post persistence with idempotency
│   └── instrumentation.ts       # Langfuse telemetry setup
└── package.json
```

## Core Functions

### `generateBlogContent(params: BlogGenerationParams)`

Standalone blog content generation function. Uses a single API call combining tool calling and structured output.

**Purpose**: Generate accurate, structured blog posts using Gemini with Code Execution Tool and Zod validation.

**Single-Call Generation:**
Uses Vercel AI SDK's combined tool calling + structured output in one `generateText` call:
1. Model uses Code Execution Tool for accurate calculations
2. Model generates structured output matching `postSchema`
3. `stopWhen: stepCountIs(3)` ensures both tool execution and output generation complete

**Parameters:**
```typescript
interface BlogGenerationParams {
  data: string;        // Pipe-delimited data (from tokeniser)
  month: string;       // Month/year (e.g., "October 2024")
  dataType: "cars" | "coe";  // Data type
}
```

**Returns:**
```typescript
interface GenerateBlogContentResult {
  object: GeneratedPost;  // Zod-validated structured output
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  response: {
    id: string;
    modelId: string;
    timestamp: Date;
  };
}

// GeneratedPost structure (from postSchema)
interface GeneratedPost {
  title: string;      // SEO title, max 100 chars
  excerpt: string;    // 2-3 sentence summary, max 500 chars
  content: string;    // Full markdown blog post (without H1 title)
  tags: string[];     // 3-5 tags in Title Case
  highlights: Array<{
    value: string;    // Metric value, e.g. "52.60%", "$125,000"
    label: string;    // Short label, e.g. "Electric Vehicles Lead"
    detail: string;   // Context, e.g. "2,081 units registered"
  }>;
}
```

**Features:**
- Single API call with combined tool calling + structured output
- Zod-validated output ensures consistent structure
- Extended thinking enabled for thorough analysis
- Langfuse telemetry for the generation
- Can be used in both workflow and non-workflow contexts

**Usage Example:**
```typescript
import { generateBlogContent, getCarsAggregatedByMonth } from "@motormetrics/ai";
import { tokeniser } from "@motormetrics/utils";

const cars = await getCarsAggregatedByMonth("October 2024");
const data = tokeniser(cars);

const { object, usage, response } = await generateBlogContent({
  data,
  month: "October 2024",
  dataType: "cars",
});

console.log(object.title);      // SEO-optimised title
console.log(object.excerpt);    // Meta description
console.log(object.content);    // Markdown content
console.log(object.tags);       // Category tags
console.log(object.highlights); // Key statistics for visual display
```

### `regenerateBlogContent(params: BlogGenerationParams)`

Regenerates an existing blog post. Same parameters and return type as `generateBlogContent()`.

## System Instructions

Comprehensive prompts are defined in `config.ts` with unified instructions for combined tool calling + structured output:

### Instructions (`INSTRUCTIONS`)

Single instruction set that guides both Code Execution and structured output generation:

**Cars Instructions:**
- Process: First use Code Execution for calculations, then generate structured output
- Data structure explanation (pipe-delimited format)
- Required calculations (totals, percentages, breakdowns)
- Required markdown structure (without H1 title)
- Table formatting requirements (proper column headers)
- SEO optimisation guidelines (title length, keywords)
- Writing style guidelines (500-700 words, professional tone)
- Highlight selection criteria (3-6 key statistics)

**COE Instructions:**
- Process: First use Code Execution for calculations, then generate structured output
- Bidding data structure
- Over-subscription rate and premium calculations
- Required sections (summary, two bidding tables)
- Premium trends and market insights
- Buyer implications
- Tag selection from predefined vocabulary

### Prompts (`PROMPTS`)

Simple prompts that reinforce the process:
- "First use code execution to calculate all metrics accurately from the data, then generate the structured blog post output."

## Structured Output Schema

Zod schemas in `schemas.ts` ensure type-safe, validated output:

### `postSchema`

Main schema for blog post generation:

```typescript
const postSchema = z.object({
  title: z.string().max(100),     // SEO title, max 60 chars preferred
  excerpt: z.string().max(500),   // 2-3 sentence summary for meta description
  content: z.string(),            // Full markdown blog post (without H1 title)
  tags: z.array(z.string()).min(1).max(10),  // 3-5 tags in Title Case
  highlights: z.array(highlightSchema).min(3).max(10),  // 3-6 key statistics
});
```

### `highlightSchema`

Schema for visual key statistics display:

```typescript
const highlightSchema = z.object({
  value: z.string(),   // Metric value, e.g. "52.60%", "$125,000"
  label: z.string(),   // Short label, e.g. "Electric Vehicles Lead"
  detail: z.string(),  // Context, e.g. "2,081 units registered"
});
```

## Tag Constants

Predefined tag vocabulary in `tags.ts` for consistent categorisation:

```typescript
const CARS_TAGS = [
  "Cars", "Registrations", "Fuel Types", "Vehicle Types",
  "Monthly Update", "New Registration", "Market Trends",
] as const;

const COE_TAGS = [
  "COE", "Quota Premium", "1st Bidding Round", "2nd Bidding Round",
  "Monthly Update", "PQP",
] as const;
```

## Hero Images

Singapore-focused Unsplash images in `hero-images.ts`:

```typescript
const HERO_IMAGES = {
  cars: "https://images.unsplash.com/photo-1519043916581-33ecfdba3b1c", // Singapore highway
  coe: "https://images.unsplash.com/photo-1519045550819-021aa92e9312",  // Marina Bay Sands
};

// Get hero image URL with size parameters (1200x514)
getHeroImage(dataType: "cars" | "coe"): string
```

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
- `stopWhen: stepCountIs(3)` ensures tool execution completes before structured output
- Single API call handles both Code Execution and validated generation

## Langfuse Telemetry

Full observability with automatic tracing for blog generation:

**Tracked Metrics:**
- Token usage (input, output, total)
- API costs per generation
- Latency and performance
- Model responses and errors
- Step count (tool calls + structured output)

**Trace Metadata:**
- `functionId`: `post-generation/cars` or `post-generation/coe`
- `month`: Data month being processed
- `dataType`: Either "cars" or "coe"
- `tags`: [dataType, month, "post-generation"]

**Configuration:**
Set environment variables to enable (optional):
```bash
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com
```

## Data Queries

Helper functions in `queries.ts`:

### `getCarsAggregatedByMonth(month: string)`

Fetches and aggregates car registration data by make, fuel type, and vehicle type.

**Returns:** Array of aggregated car records with counts.

### `getCoeForMonth(month: string)`

Fetches COE bidding results for a specific month.

**Returns:** Array of COE records with bidding details.

## Post Persistence

### `savePost(params: SavePostParams)`

Saves blog post to database with idempotent conflict handling.

**Parameters:**
```typescript
interface SavePostParams {
  title: string;
  content: string;
  metadata: {
    month: string;
    dataType: string;
    responseId: string;
    modelId: string;
    timestamp: Date;
    usage: TokenUsage;
  };
}
```

**Features:**
- Pre-save check for existing posts
- `onConflictDoNothing` strategy (preserves existing posts)
- Automatic slug generation
- Cache tag revalidation

## Dependencies

**Core:**
- `@ai-sdk/google` - Google Gemini integration
- `ai` - Vercel AI SDK

**Observability:**
- `@langfuse/otel`: ^4.2.0 - Langfuse OpenTelemetry integration
- `@opentelemetry/sdk-trace-node`: ^2.1.0 - Tracing SDK

**Workspace:**
- `@motormetrics/database`: Database schemas and queries
- `@motormetrics/utils`: Utility functions (tokeniser, slugify, Redis)

## Usage Patterns

### Pattern 1: Standalone Generation (Admin App)

```typescript
import { generateBlogContent, shutdownTracing, getHeroImage } from "@motormetrics/ai";

try {
  const { object, usage, response } = await generateBlogContent({
    data: tokenisedData,
    month: "October 2024",
    dataType: "cars",
  });

  // Access structured output fields
  console.log(object.title);      // SEO-optimised title
  console.log(object.excerpt);    // Meta description
  console.log(object.content);    // Markdown content
  console.log(object.tags);       // Category tags
  console.log(object.highlights); // Key statistics

  // Get hero image for the data type
  const heroImage = getHeroImage("cars");
} finally {
  // Shutdown tracing to flush spans
  await shutdownTracing();
}
```

### Pattern 2: Workflow Integration (Vercel WDK)

```typescript
import { generateBlogContent } from "@motormetrics/ai";
import { tokeniser } from "@motormetrics/utils";
import { fetch } from "workflow";

export async function carsWorkflow(payload: { month?: string }) {
  "use workflow";

  // Enable WDK's durable fetch for AI SDK
  globalThis.fetch = fetch;

  // Fetch and tokenise data
  const carsData = await fetchCarsData(month);
  const data = tokeniser(carsData);

  // Generate blog post (step function)
  const post = await generateCarsPost(data, month);

  return { postId: post.postId, title: post.title };
}

async function generateCarsPost(data: string, month: string) {
  "use step";
  return generateBlogContent({ data, month, dataType: "cars" });
}
```

**Note:** When using within Vercel WDK workflows, set `globalThis.fetch = fetch` (from the `workflow` package) before calling AI functions to enable durable fetch with automatic retries.

## Code Style

- **TypeScript**: Strict mode with proper type definitions
- **Error Handling**: Try/catch blocks with console logging
- **Async/Await**: Promise-based patterns
- **Imports**: Workspace packages via `/*`

## Testing

No tests currently implemented. Future testing should cover:
- Blog content generation accuracy
- Code Execution Tool functionality
- Post persistence idempotency
- Telemetry data collection

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
