import {
  getPQPOverview,
  PQP_REPORTED_CATEGORIES,
} from "@web/queries/coe/pqp/overview";
import {
  queueSelect,
  queueSelectDistinct,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getPQPOverview", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("provides an overview of PQP insights with savings calculations", async () => {
    // Recent PQP months, read in the first batch
    queueSelectDistinct([{ month: "2024-06" }]);
    queueSelect(
      // Latest COE month and bidding number subqueries
      [],
      [],
      // Latest exercise premiums, read in the first batch
      [
        { vehicleClass: "Category A", premium: 120 },
        { vehicleClass: "Category B", premium: 0 },
      ],
      // PQP rates for the recent months
      [
        { month: "2024-06", vehicleClass: "Category A", pqp: 100 },
        { month: "2024-06", vehicleClass: "Category B", pqp: 0 },
      ],
    );

    const result = await getPQPOverview();

    expect(result.latestMonth).toBe("2024-06");
    expect(result.tableRows).toEqual([
      {
        key: "2024-06",
        month: "2024-06",
        "Category A": 100,
        "Category B": 0,
        "Category C": 0,
        "Category D": 0,
      },
    ]);
    expect(result.comparison).toEqual([
      {
        category: "Category A",
        latestPremium: 120,
        pqpRate: 100,
        difference: 20,
        differencePercent: 20,
      },
      {
        category: "Category B",
        latestPremium: 0,
        pqpRate: 0,
        difference: 0,
        differencePercent: 0,
      },
    ]);
    const categoryA = result.categorySummaries.find(
      (row) => row.category === "Category A",
    );
    expect(categoryA).toMatchObject({
      pqpCost5Year: 50,
      pqpCost10Year: 100,
      savings10Year: 20,
    });
  });

  it("handles empty PQP data gracefully", async () => {
    queueSelectDistinct([]);

    const result = await getPQPOverview();

    expect(result.tableRows).toEqual([]);
    // One summary per reported category — A and B, until C and D are brought in.
    expect(result.categorySummaries).toHaveLength(
      PQP_REPORTED_CATEGORIES.length,
    );
  });
});
