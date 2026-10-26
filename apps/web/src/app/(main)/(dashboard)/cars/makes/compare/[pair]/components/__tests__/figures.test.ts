import { buildMakeFigures } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/figures";
import type { MakeCrossTabRow } from "@web/queries/cars/makes/period-totals";
import { describe, expect, it } from "vitest";

const row = (
  month: string,
  count: number,
  fuelType = "Petrol",
  vehicleType = "Sedan",
): MakeCrossTabRow => ({ count, fuelType, month, vehicleType });

describe("buildMakeFigures", () => {
  it("should total January to the month against the same months a year earlier", () => {
    const figures = buildMakeFigures(
      [
        row("2026-09", 10, "Electric", "Sports Utility Vehicle"),
        row("2026-01", 20),
        row("2025-12", 99),
        row("2025-09", 12),
        row("2025-10", 50),
        row("2025-01", 8),
      ],
      "2026-09",
    );

    expect(figures.ytd).toBe(30);
    expect(figures.previous).toBe(20);
    expect(figures.change).toBe(50);
    expect(figures.electric).toBe(10);
    expect(figures.fuelCounts.get("Petrol")).toBe(20);
    expect(figures.vehicleCounts.get("Sports Utility Vehicle")).toBe(10);
  });

  it("should cover January alone when the latest month is January", () => {
    const figures = buildMakeFigures(
      [row("2026-01", 5), row("2025-12", 40), row("2025-01", 4)],
      "2026-01",
    );

    expect(figures.ytd).toBe(5);
    expect(figures.previous).toBe(4);
  });

  it("should zero-fill months with no registrations in the 24-month series", () => {
    const figures = buildMakeFigures(
      [
        row("2026-09", 7),
        row("2026-07", 3),
        row("2024-10", 2),
        row("2024-09", 9),
      ],
      "2026-09",
    );

    expect(figures.series).toHaveLength(24);
    expect(figures.series[0]).toBe(2);
    expect(figures.series.at(-2)).toBe(0);
    expect(figures.series.at(-3)).toBe(3);
    expect(figures.series.at(-1)).toBe(7);
  });

  it("should give no change without a baseline and no electric when absent", () => {
    const figures = buildMakeFigures([row("2026-03", 5)], "2026-09");

    expect(figures.change).toBeNull();
    expect(figures.electric).toBe(0);
  });
});
