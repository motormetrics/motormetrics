import { getPQPOverview } from "@web/queries/coe/pqp/overview";
import { getPqpRates } from "@web/queries/coe/pqp/rates";
import { describe, expect, it } from "vitest";
import {
  queueBatch,
  queueSelect,
  queueSelectDistinct,
  resetDbMocks,
} from "./test-utils";

describe("PQP queries", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("provides an overview of PQP insights with savings calculations", async () => {
    queueSelectDistinct([]);
    queueSelect([], []);
    queueBatch([
      [{ month: "2024-06" }],
      [{ month: "2024-06" }],
      [{ month: "2024-06" }],
    ]);
    queueSelect([], [], []);
    queueBatch([
      [{ month: "2024-06", vehicleClass: "Category A", pqp: 100 }],
      [{ biddingNo: 2 }],
      [
        { vehicleClass: "Category A", pqp: 100 },
        { vehicleClass: "Category B", pqp: 0 },
      ],
    ]);
    queueSelect([
      { vehicleClass: "Category A", premium: 120 },
      { vehicleClass: "Category B", premium: 0 },
    ]);

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
      {
        category: "Category C",
        latestPremium: 0,
        pqpRate: 0,
        difference: 0,
        differencePercent: 0,
      },
      {
        category: "Category D",
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
    queueSelect([], []);
    queueBatch([[], [], []]);

    const result = await getPQPOverview();

    expect(result.tableRows).toEqual([]);
    expect(result.categorySummaries).toHaveLength(4);
  });

  it("groups PQP rates by month and vehicle class", async () => {
    queueSelect([
      {
        month: "2024-06",
        vehicleClass: "Category A",
        pqp: 100,
      },
      {
        month: "2024-05",
        vehicleClass: "Category B",
        pqp: 90,
      },
      {
        month: "2024-04",
        vehicleClass: "Category C",
        pqp: 80,
      },
    ]);

    const result = await getPqpRates();

    expect(result).toEqual({
      "2024-06": { "Category A": 100 },
      "2024-05": { "Category B": 90 },
      "2024-04": { "Category C": 80 },
    });
  });
});
