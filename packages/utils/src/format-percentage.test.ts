import { describe, expect, it } from "vitest";
import { formatPercent, formatPercentage } from "./format-percentage";

describe("formatPercentage", () => {
  it("should format a value with 1 decimal place and % suffix", () => {
    expect(formatPercentage(25.5)).toBe("25.5%");
    expect(formatPercentage(0)).toBe("0.0%");
    expect(formatPercentage(100)).toBe("100.0%");
  });

  it("should round to 1 decimal place", () => {
    expect(formatPercentage(33.333)).toBe("33.3%");
    expect(formatPercentage(66.666)).toBe("66.7%");
  });

  it("should handle negative values", () => {
    expect(formatPercentage(-5.5)).toBe("-5.5%");
  });
});

describe("formatPercent", () => {
  it("should format a decimal value as a percentage", () => {
    expect(formatPercent(0.5)).toBe("50%");
    expect(formatPercent(1)).toBe("100%");
    expect(formatPercent(0)).toBe("0%");
  });

  it("should accept Intl.NumberFormat options", () => {
    expect(formatPercent(0.255, { minimumFractionDigits: 1 })).toBe("25.5%");
  });

  it("should round by default", () => {
    expect(formatPercent(0.255)).toBe("26%");
    expect(formatPercent(0.254)).toBe("25%");
  });
});
