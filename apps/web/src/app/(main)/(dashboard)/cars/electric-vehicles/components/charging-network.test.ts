import { describe, expect, it } from "vitest";
import { deriveChargingNetworkGrowth } from "./charging-network";

describe("deriveChargingNetworkGrowth", () => {
  it("should return null for an empty series", () => {
    expect(deriveChargingNetworkGrowth([])).toBeNull();
  });

  it("should measure the last twelve months against the network a year earlier", () => {
    const result = deriveChargingNetworkGrowth([
      { month: "2024-02", count: 5000 },
      { month: "2024-06", count: 1000 },
      { month: "2025-06", count: 400 },
      { month: "2025-12", count: 300 },
      { month: "2026-06", count: 300 },
    ]);

    // Anchor is 2026-06, so the base is everything up to and including
    // 2025-06: 6,400. Added since: 600.
    expect(result).toEqual({
      asOf: "2026-06",
      addedLastYear: 600,
      growthPercent: (600 / 6400) * 100,
    });
  });

  it("should fold the registration backlog into the base, not the growth", () => {
    const result = deriveChargingNetworkGrowth([
      { month: "2024-02", count: 6000 },
      { month: "2025-03", count: 100 },
    ]);

    expect(result?.growthPercent).toBeCloseTo((100 / 6000) * 100);
  });

  it("should return a null percentage when the series is shorter than a year", () => {
    const result = deriveChargingNetworkGrowth([
      { month: "2026-01", count: 50 },
      { month: "2026-06", count: 70 },
    ]);

    expect(result).toEqual({
      asOf: "2026-06",
      addedLastYear: 120,
      growthPercent: null,
    });
  });

  it("should handle a December anchor when shifting the cutoff", () => {
    const result = deriveChargingNetworkGrowth([
      { month: "2024-12", count: 100 },
      { month: "2025-12", count: 10 },
    ]);

    expect(result?.growthPercent).toBeCloseTo(10);
  });
});
