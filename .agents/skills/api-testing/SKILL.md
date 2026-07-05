---
name: api-testing
description: Write and run API tests with Vitest for endpoints, middleware, and integrations. Use when testing API functionality, request/response validation, or error handling.
allowed-tools: Read, Edit, Write, Bash, Grep, Glob
---

# API Testing Skill

## Running Tests

```bash
pnpm test                  # Run all tests
pnpm test:watch            # Watch mode
pnpm test:coverage         # With coverage
pnpm -F @sgcarstrends/web test              # Run web tests
pnpm -F @sgcarstrends/web test:watch        # Watch mode for web
```

## Test Structure

```
apps/web/__tests__/
├── setup.ts              # Test setup
├── helpers.ts            # Test utilities
├── queries/              # Query tests
├── components/           # Component tests
└── utils/                # Utility tests
```

## Testing API Routes

### Basic Endpoint Test

```typescript
import { describe, it, expect } from "vitest";

describe("GET /api/health", () => {
  it("returns 200 OK", async () => {
    const res = await fetch("http://localhost:3000/api/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
```

### Testing with Query Params

```typescript
describe("GET /api/cars", () => {
  it("filters by month", async () => {
    const res = await fetch("http://localhost:3000/api/cars?month=2024-01");
    expect(res.status).toBe(200);
  });

  it("returns 400 for invalid month", async () => {
    const res = await fetch("http://localhost:3000/api/cars?month=invalid");
    expect(res.status).toBe(400);
  });
});
```

### Testing POST Endpoints

```typescript
describe("POST /api/posts", () => {
  it("creates a new post", async () => {
    const res = await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "Test", content: "Content" }),
    });
    expect(res.status).toBe(201);
  });
});
```

## Mocking

### Mock Database

```typescript
import { vi } from "vitest";
import { db } from "../src/config/database";

vi.spyOn(db.query.cars, "findMany").mockResolvedValue([
  { make: "Toyota", model: "Corolla", number: 100 },
]);
```

### Mock External APIs

```typescript
const mockFetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ records: [] }),
});
global.fetch = mockFetch;
```

### Mock Redis

```typescript
vi.mock("@sgcarstrends/utils", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));
```

## Test Helpers

```typescript
// apps/web/__tests__/helpers.ts
export const createAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

export const seedDatabase = async (data: any[]) => {
  await db.insert(cars).values(data);
};

export const clearDatabase = async () => {
  await db.delete(cars);
};
```

## Best Practices

1. **Isolate tests** - Each test should be independent
2. **Test error cases** - Test both happy and error paths
3. **Use mocks** - Mock external dependencies
4. **Clean up** - Reset state in afterEach
5. **Descriptive names** - Clear test descriptions
6. **Coverage goals** - Aim for 80%+ coverage

## Coverage Configuration

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      thresholds: { lines: 80, functions: 80, branches: 80 },
    },
  },
});
```

## References

- Vitest: https://vitest.dev
- Next.js Testing: https://nextjs.org/docs/app/building-your-application/testing
