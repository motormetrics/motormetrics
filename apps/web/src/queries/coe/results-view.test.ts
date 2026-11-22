import { coeResults } from "@motormetrics/database/schema";
import { getViewConfig, PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";

// The COE page queries read `coe_results`; these lock its merge rules.
const { sql } = new PgDialect().sqlToQuery(
  // biome-ignore lint/style/noNonNullAssertion: the view is defined with a query
  getViewConfig(coeResults).query!,
);

describe("coe_results view", () => {
  it("should return every coe row unchanged", () => {
    expect(sql).toMatch(
      /^\(select "month", "bidding_no", "vehicle_class", "quota", "bids_success", "bids_received", "premium" from "coe"\) union all /,
    );
  });

  it("should add interim rows only for exercises not yet in coe", () => {
    expect(sql).toContain(
      'from "coe_interim_results" where not exists (select "month" from "coe" where (("coe"."month" = "coe_interim_results"."month") and ("coe"."bidding_no" = "coe_interim_results"."bidding_no")))',
    );
  });
});
