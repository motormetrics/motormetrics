import { getPqpRates } from "@web/queries/coe/pqp/rates";
import { queueSelect, resetDbMocks } from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getPqpRates", () => {
  beforeEach(() => {
    resetDbMocks();
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
