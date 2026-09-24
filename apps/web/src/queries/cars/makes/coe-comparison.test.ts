import { getMakeCoeComparison } from "@web/queries/cars/makes/coe-comparison";
import { queueBatch, resetDbMocks } from "@web/queries/test-utils";
import { beforeEach, describe, expect, it } from "vitest";

describe("getMakeCoeComparison", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return empty array when no registrations exist", async () => {
    queueBatch([[], []]);

    const result = await getMakeCoeComparison("TOYOTA");

    expect(result).toEqual([]);
  });

  it("should return data with COE premiums merged by month", async () => {
    queueBatch([
      [{ month: "2024-01", count: 50 }],
      [
        {
          month: "2024-01",
          categoryAPremium: 95000,
          categoryBPremium: 110000,
        },
      ],
    ]);

    const result = await getMakeCoeComparison("TOYOTA");

    expect(result).toEqual([
      {
        month: "2024-01",
        registrations: 50,
        categoryAPremium: 95000,
        categoryBPremium: 110000,
      },
    ]);
  });

  it("should default to 0 when COE categoryAPremium is null", async () => {
    queueBatch([
      [{ month: "2024-01", count: 50 }],
      [{ month: "2024-01", categoryAPremium: null, categoryBPremium: 110000 }],
    ]);

    const result = await getMakeCoeComparison("TOYOTA");

    expect(result[0].categoryAPremium).toBe(0);
    expect(result[0].categoryBPremium).toBe(110000);
  });

  it("should default to 0 when COE categoryBPremium is null", async () => {
    queueBatch([
      [{ month: "2024-01", count: 50 }],
      [{ month: "2024-01", categoryAPremium: 95000, categoryBPremium: null }],
    ]);

    const result = await getMakeCoeComparison("TOYOTA");

    expect(result[0].categoryAPremium).toBe(95000);
    expect(result[0].categoryBPremium).toBe(0);
  });

  it("should return 0 premiums when month has no matching COE data", async () => {
    queueBatch([
      [{ month: "2024-01", count: 50 }],
      [], // no COE data
    ]);

    const result = await getMakeCoeComparison("TOYOTA");

    expect(result[0].categoryAPremium).toBe(0);
    expect(result[0].categoryBPremium).toBe(0);
  });

  it("should handle multiple months with partial COE coverage", async () => {
    queueBatch([
      [
        { month: "2024-01", count: 50 },
        { month: "2024-02", count: 30 },
      ],
      [
        {
          month: "2024-01",
          categoryAPremium: 95000,
          categoryBPremium: 110000,
        },
        // no 2024-02 COE entry
      ],
    ]);

    const result = await getMakeCoeComparison("TOYOTA");

    expect(result).toHaveLength(2);
    expect(result[0].categoryAPremium).toBe(95000);
    expect(result[1].categoryAPremium).toBe(0); // no COE for 2024-02
    expect(result[1].categoryBPremium).toBe(0);
  });
});
