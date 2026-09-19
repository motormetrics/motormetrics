---
name: cache-components
description: Ensure 'use cache' is used strategically to minimize CPU usage and ISR writes. Use when creating/modifying queries to verify caching decisions align with data update patterns and cost optimization.
---

# Cache Components Skill

This Skill ensures strategic use of Next.js 16 Cache Components to minimize CPU usage and ISR write overhead while maximizing cost efficiency.

## When to Activate

- After creating new data fetching queries
- When modifying existing query functions
- During performance optimization reviews
- Before deploying changes that affect data loading
- When evaluating caching strategy for new features

## Core Philosophy: Cache Strategically, Not Universally

**NOT every query needs `"use cache"`**. Apply caching only when:

✅ **Good Caching Candidates**:
- Static data updated on predictable schedules (monthly car registration data)
- Expensive database queries with consistent results
- Read-heavy operations with infrequent updates
- Data shared across multiple users (public statistics, COE results)

❌ **Poor Caching Candidates**:
- User-specific queries (personalized dashboards, user preferences)
- Frequently changing data (real-time analytics, live counters)
- One-off queries with unique parameters
- Write operations (mutations, form submissions)
- Data that changes more than once per day

## CPU & ISR Cost Analysis

**Why Strategic Caching Matters**:

Without caching:
- Every page load = 1 database query + 1 server render
- High CPU usage from repeated queries
- Immediate cost: Database load

With **well-planned** caching (`cacheLife("max")` with 30-day revalidation):
- ~2 regenerations/month (1 automatic + 1 manual via `revalidateTag()`)
- **15x CPU savings** vs daily revalidation
- Reduced ISR writes (domain-level tags, not per-query)

With **poorly-planned** caching (short revalidation periods, granular tags):
- Frequent regenerations increase CPU usage
- Excessive ISR writes from over-granular cache tags
- Higher costs without proportional benefit

## Implementation Checklist

### 1. Evaluate Caching Necessity

**Before adding `"use cache"`, ask**:
- How often does this data change?
- Is this data user-specific or global?
- Will caching reduce CPU more than ISR write overhead?
- Does this align with our monthly data update cycle?

### 2. Correct Cache Pattern (When Caching Is Justified)

```typescript
import { CACHE_TAG } from "@web/lib/cache";
import { cacheLife, cacheTag } from "next/cache";

export const getCarRegistrations = async () => {
  "use cache: remote";  // remote: shared Vercel Data Cache, not per-instance memory
  cacheLife("max");  // 30-day revalidation for monthly data
  cacheTag(CACHE_TAG.CARS);  // Domain-level tag, NOT per-query

  return db.query.cars.findMany({
    // ... query logic
  });
};
```

### 3. Cache Tag Strategy

**Use domain-level tags** (from `src/lib/cache.ts`):
- `CACHE_TAG.CARS` - All car registration queries
- `CACHE_TAG.COE` - All COE bidding queries
- `CACHE_TAG.POSTS` - All blog post queries

**Why domain-level?**
- ✅ Minimizes ISR write overhead
- ✅ Aligns with bulk monthly data updates
- ✅ Simple invalidation: `revalidateTag(CACHE_TAG.CARS)`
- ❌ Avoid: Per-query tags like `car-${make}-${year}` (excessive ISR writes)

### 4. Cache Life Profile

**Project uses custom "max" profile** (`next.config.ts`):
```typescript
cacheLife: {
  max: {
    stale: 2592000,      // 30 days - client cache
    revalidate: 2592000, // 30 days - automatic regeneration
    expire: 31536000,    // 1 year - cache expiration
  },
}
```

**When to use `cacheLife("max")`**:
- Data updated monthly (car registrations, COE results)
- Static content with predictable refresh cycles
- Public data shared across all users

**When NOT to use caching**:
- Data changing daily or more frequently
- User-specific queries
- Real-time or near-real-time data

## Common Patterns

### ✅ Good: Static Monthly Data

```typescript
export const getLatestCOE = async (): Promise<COEResult[]> => {
  "use cache: remote";
  cacheLife("max");  // Monthly updates = perfect fit
  cacheTag(CACHE_TAG.COE);

  return db.query.coe.findFirst({
    orderBy: desc(coe.month),
  });
};
```

**Why this works**: COE data updates 2x/month, 30-day cache = ~2 regenerations/month.

### ❌ Bad: User-Specific Data

```typescript
// DON'T DO THIS
export const getUserPreferences = async (userId: string) => {
  "use cache";  // ❌ Wrong! User-specific data shouldn't be cached globally
  cacheLife("max");
  cacheTag(CACHE_TAG.USERS);

  return db.query.users.findFirst({ where: eq(users.id, userId) });
};
```

**Why this fails**: Each user needs their own data, global caching creates stale/wrong results.

### ❌ Bad: Frequently Changing Data

```typescript
// DON'T DO THIS
export const getBlogViewCount = async (postId: string) => {
  "use cache";  // ❌ Wrong! View counts change on every page view
  cacheLife("max");
  cacheTag(CACHE_TAG.POSTS);

  return db.query.analytics.count({ where: eq(analytics.postId, postId) });
};
```

**Why this fails**: 30-day cache on data that changes every minute = stale data.

### ✅ Good: Write Operations (No Caching)

```typescript
export const createPost = async (data: PostInput) => {
  // NO "use cache" - write operations should never be cached
  const result = await db.insert(posts).values(data);

  // Invalidate cache AFTER write
  revalidateTag(CACHE_TAG.POSTS);

  return result;
};
```

## Revalidation Strategy

**Prefer manual revalidation over automatic**:

```typescript
// In API route or workflow after data import
import { revalidateTag } from "next/cache";
import { CACHE_TAG } from "@web/lib/cache";

// After monthly LTA data import completes
revalidateTag(CACHE_TAG.CARS);  // Immediate cache refresh
revalidateTag(CACHE_TAG.COE);
```

**Benefits**:
- Immediate cache refresh when new data arrives
- Bypasses 30-day automatic revalidation
- More predictable than time-based revalidation

## Validation Checklist

When reviewing query functions, verify:

1. **Caching is justified**: Does this reduce CPU more than ISR overhead?
2. **Correct imports**: `cacheLife`, `cacheTag` from `next/cache`, `CACHE_TAG` from `@web/lib/cache`
3. **Appropriate profile**: `cacheLife("max")` for monthly data
4. **Domain-level tags**: Using `CACHE_TAG.*`, not granular per-query tags
5. **No caching of**: User-specific data, frequently changing data, write operations

## Tools Used

- **Grep**: Search for queries missing cache directives or using incorrect patterns
- **Read**: Examine specific query files for proper implementation
- **Glob**: Find all query files in target directories

## Target Directories

- `src/queries/cars/` - Car registration queries
- `src/queries/coe/` - COE bidding queries
- `src/queries/logos/` - Logo fetching queries
- Co-located query files in app routes (e.g., `src/app/blog/_queries/`)

## Performance Impact

**Strategic Caching** (monthly data with 30-day revalidation):
- ✅ 15x CPU savings vs daily revalidation
- ✅ Minimal ISR writes (domain-level tags)
- ✅ Instant page loads for 30 days
- ✅ Lower infrastructure costs

**Over-Caching** (caching everything with short revalidation):
- ❌ Frequent regenerations = high CPU usage
- ❌ Excessive ISR writes from granular tags
- ❌ Stale data for user-specific/real-time queries
- ❌ Higher costs without benefit

**Under-Caching** (no caching at all):
- ❌ Every page load hits database
- ❌ High CPU usage from repeated queries
- ❌ Slower page loads
- ❌ Higher database load

## Related Documentation

- Project cache strategy: `apps/web/AGENTS.md` (Cache Components & Optimization section)
- Cache configuration: `next.config.ts` (cacheLife profile)
- Cache tags: `src/lib/cache.ts` (CACHE_TAG constants)
- Next.js Cache Components: Use Context7 MCP with `/vercel/next.js`
