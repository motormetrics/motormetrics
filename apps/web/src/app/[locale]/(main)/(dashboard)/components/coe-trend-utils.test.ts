import { describe, expect, it } from "vitest";
import { calculateChangePercent, calculateTrend } from "./coe-trend-utils";

describe("calculateTrend", () => {
  it("should return 'up' when current is greater than previous", () => {
    expect(calculateTrend(100, 50)).toBe("up");
    expect(calculateTrend(1, 0)).toBe("up");
    expect(calculateTrend(100000, 99999)).toBe("up");
  });

  it("should return 'down' when current is less than previous", () => {
    expect(calculateTrend(50, 100)).toBe("down");
    expect(calculateTrend(0, 1)).toBe("down");
    expect(calculateTrend(99999, 100000)).toBe("down");
  });

  it("should return 'neutral' when current equals previous", () => {
    expect(calculateTrend(100, 100)).toBe("neutral");
    expect(calculateTrend(0, 0)).toBe("neutral");
    expect(calculateTrend(50000, 50000)).toBe("neutral");
  });

  it("should handle negative numbers", () => {
    expect(calculateTrend(-50, -100)).toBe("up");
    expect(calculateTrend(-100, -50)).toBe("down");
    expect(calculateTrend(-100, -100)).toBe("neutral");
  });

  it("should handle decimal numbers", () => {
    expect(calculateTrend(100.5, 100.4)).toBe("up");
    expect(calculateTrend(100.4, 100.5)).toBe("down");
    expect(calculateTrend(100.5, 100.5)).toBe("neutral");
  });
});

describe("calculateChangePercent", () => {
  it("should return '0.0%' when previous is zero", () => {
    expect(calculateChangePercent(100, 0)).toBe("0.0%");
    expect(calculateChangePercent(0, 0)).toBe("0.0%");
    expect(calculateChangePercent(-100, 0)).toBe("0.0%");
  });

  it("should return positive percentage with '+' sign for increases", () => {
    expect(calculateChangePercent(110, 100)).toBe("+10.0%");
    expect(calculateChangePercent(200, 100)).toBe("+100.0%");
    expect(calculateChangePercent(150, 100)).toBe("+50.0%");
  });

  it("should return negative percentage without '+' sign for decreases", () => {
    expect(calculateChangePercent(90, 100)).toBe("-10.0%");
    expect(calculateChangePercent(50, 100)).toBe("-50.0%");
    expect(calculateChangePercent(0, 100)).toBe("-100.0%");
  });

  it("should return '0.0%' when there is no change", () => {
    expect(calculateChangePercent(100, 100)).toBe("0.0%");
    expect(calculateChangePercent(50000, 50000)).toBe("0.0%");
  });

  it("should handle decimal precision correctly", () => {
    expect(calculateChangePercent(101, 100)).toBe("+1.0%");
    expect(calculateChangePercent(100.5, 100)).toBe("+0.5%");
    expect(calculateChangePercent(103, 100)).toBe("+3.0%");
  });

  it("should handle large numbers", () => {
    expect(calculateChangePercent(1100000, 1000000)).toBe("+10.0%");
    expect(calculateChangePercent(900000, 1000000)).toBe("-10.0%");
  });

  it("should handle small decimal changes", () => {
    expect(calculateChangePercent(100.01, 100)).toBe("+0.0%");
    expect(calculateChangePercent(100.1, 100)).toBe("+0.1%");
  });
});
