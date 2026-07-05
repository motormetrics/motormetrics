---
name: monitoring
description: Monitor Vercel deployments, debug production issues, check logs, and understand logging patterns. Use when investigating errors, checking deployment logs, debugging failures, or improving observability.
allowed-tools: Bash, Read, Edit, Write, Grep
---

# Monitoring Skill

Monitor Vercel deployments, check logs, and track errors.

## Viewing Logs

### Vercel Dashboard

1. Go to Vercel Dashboard → Project → Logs
2. Filter by:
   - Function logs
   - Build logs
   - Edge function logs
   - Time range

### Vercel CLI

```bash
# View recent logs
vercel logs <deployment-url>

# Stream logs in real-time
vercel logs <deployment-url> --follow

# Filter by status
vercel logs <deployment-url> --status error
```

## Vercel Analytics

### Web Vitals

Monitor in Vercel Dashboard → Analytics:
- **LCP** (Largest Contentful Paint)
- **FID** (First Input Delay)
- **CLS** (Cumulative Layout Shift)
- **TTFB** (Time to First Byte)

### Speed Insights

Already integrated in the app:

```typescript
// apps/web/src/app/layout.tsx
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const RootLayout = ({ children }) => (
  <html>
    <body>
      {children}
      <Analytics />
      <SpeedInsights />
    </body>
  </html>
);
```

## Logging Patterns

The codebase uses standard `console.log/error/warn` for logging:

```typescript
// Workflow logging pattern
console.log("[WORKFLOW] Posts cache invalidated");
console.log("[COE]", coeResult);

// Error logging pattern
console.error("Error getting post view count:", error);
console.error("Download failed:", { url, status });
```

**Log Prefixes Used:**
- `[WORKFLOW]` - Workflow execution events
- `[COE]` - COE data processing
- `[CARS]` - Car data processing

## Health Checks

The app has a health check endpoint at `/api/health`:

```typescript
// apps/web/src/app/api/health/route.ts
export const GET = () => {
  return NextResponse.json(
    { status: "ok", timestamp: new Date().toISOString() },
    {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
};
```

**Test health endpoint:**

```bash
curl -f https://sgcarstrends.com/api/health || echo "Web unhealthy"
```

## Workflow Error Handling

Workflows use Vercel WDK's built-in error handling:

```typescript
// apps/web/src/workflows/cars/index.ts
import { FatalError, RetryableError } from "workflow";

// Retryable errors (will be retried automatically)
if (message.includes("429")) {
  throw new RetryableError("AI rate limited", { retryAfter: "1m" });
}

// Fatal errors (will not be retried)
if (message.includes("401") || message.includes("403")) {
  throw new FatalError("AI authentication failed");
}
```

**Error Types:**
- `RetryableError` - Temporary failures (rate limits, network issues)
- `FatalError` - Permanent failures (auth errors, invalid config)

## Debugging Production Issues

### 1. Check Vercel Logs

```bash
# Get deployment URL
vercel ls

# Check logs
vercel logs <url> --follow
```

### 2. Check Build Output

1. Vercel Dashboard → Deployments
2. Click on deployment
3. View "Build Logs"

### 3. Test Endpoint

```bash
curl -v https://sgcarstrends.com/api/health
```

### 4. Check Function Runtime

Vercel Dashboard → Project → Settings → Functions
- View runtime version
- Check memory allocation
- Review timeout settings

## Common Issues

| Issue | Investigation | Solution |
|-------|--------------|----------|
| High latency | Check Vercel Analytics, slow queries | Optimize queries, add caching |
| Build failures | Check build logs | Fix build errors, update dependencies |
| Function timeout | Check function logs | Optimize code, increase timeout |
| Cold starts | Check function invocations | Consider edge functions |
| Workflow failures | Check Vercel logs for workflow ID | Review error type, check retries |

## Vercel Function Configuration

```typescript
// API route config
export const config = {
  maxDuration: 60, // seconds (Pro plan allows up to 60s)
};
```

## Cron Job Monitoring

Workflows are triggered by Vercel Cron:

```json
// apps/web/vercel.json
{
  "crons": [
    { "path": "/api/workflows/cars", "schedule": "0 10 * * *" },
    { "path": "/api/workflows/coe", "schedule": "0 10 * * *" },
    { "path": "/api/workflows/deregistrations", "schedule": "0 10 * * *" }
  ]
}
```

**Monitor cron executions:**
1. Vercel Dashboard → Project → Cron Jobs
2. View execution history and status
3. Check logs for each execution

## Best Practices

1. **Use Log Prefixes**: Add `[CONTEXT]` prefix for easy filtering
2. **Log Meaningful Data**: Include relevant context (month, record counts)
3. **Don't Log Secrets**: Never log passwords, tokens, API keys
4. **Use Vercel Analytics**: Monitor performance metrics
5. **Check Cron Jobs**: Monitor scheduled workflow executions

## References

- Vercel Logs: https://vercel.com/docs/observability/runtime-logs
- Vercel Analytics: https://vercel.com/docs/analytics
- Speed Insights: https://vercel.com/docs/speed-insights
- Vercel Cron Jobs: https://vercel.com/docs/cron-jobs
