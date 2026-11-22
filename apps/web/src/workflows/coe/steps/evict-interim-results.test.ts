import { beforeEach, describe, expect, it, vi } from "vitest";

const executed = vi.hoisted(() => ({ sql: [] as string[], rowCount: 0 }));

// A real Drizzle instance over a fake Neon client, so the test sees the exact
// statement the step sends. The shared test setup mocks the client otherwise.
vi.mock("@motormetrics/database/client", async () => {
  const { drizzle } = await vi.importActual<
    typeof import("drizzle-orm/neon-http")
  >("drizzle-orm/neon-http");
  const client = async (sql: string) => {
    executed.sql.push(sql);
    return { rows: [], fields: [], rowCount: executed.rowCount };
  };
  return { db: drizzle({ client: client as never }) };
});

import { evictInterimResults } from "@web/workflows/coe/steps/evict-interim-results";

describe("evictInterimResults", () => {
  beforeEach(() => {
    executed.sql.length = 0;
    executed.rowCount = 0;
  });

  it("should delete only interim rows whose month and bidding number are both in coe", async () => {
    await evictInterimResults();

    const [statement] = executed.sql;
    // Both conditions, correlated on the outer row: a row whose month is in
    // `coe` under a different bidding number (or the reverse) is kept.
    expect(statement).toBe(
      'delete from "coe_interim_results" where exists (select "id" from "coe" where (("coe"."month" = "coe_interim_results"."month") and ("coe"."bidding_no" = "coe_interim_results"."bidding_no")))',
    );
  });

  it("should return the number of rows deleted", async () => {
    executed.rowCount = 5;

    expect(await evictInterimResults()).toBe(5);
  });
});
