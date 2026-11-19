import { describe, expect, it } from "vitest";
import { formatCurrency, formatNumber } from "./format-currency";

describe("formatNumber", () => {
  it("should format numbers with thousand separators", () => {
    expect(formatNumber(1000)).toBe("1,000");
    expect(formatNumber(50000)).toBe("50,000");
    expect(formatNumber(100000)).toBe("100,000");
  });

  it("should format decimal numbers without fraction digits", () => {
    expect(formatNumber(1000.5)).toBe("1,001");
    expect(formatNumber(999.99)).toBe("1,000");
    expect(formatNumber(1000.1)).toBe("1,000");
  });

  it("should handle zero value", () => {
    expect(formatNumber(0)).toBe("0");
  });

  it("should handle negative values", () => {
    expect(formatNumber(-1000)).toBe("-1,000");
    expect(formatNumber(-50000)).toBe("-50,000");
  });

  it("should handle large numbers", () => {
    expect(formatNumber(1000000)).toBe("1,000,000");
    expect(formatNumber(1234567)).toBe("1,234,567");
  });

  it("should handle small numbers", () => {
    expect(formatNumber(1)).toBe("1");
    expect(formatNumber(99)).toBe("99");
  });
});

describe("formatCurrency", () => {
  it("should format whole numbers with $ prefix", () => {
    expect(formatCurrency(1000)).toBe("$1,000");
    expect(formatCurrency(50000)).toBe("$50,000");
    expect(formatCurrency(100000)).toBe("$100,000");
  });

  it("should format decimal numbers without fraction digits", () => {
    expect(formatCurrency(1000.5)).toBe("$1,001");
    expect(formatCurrency(999.99)).toBe("$1,000");
    expect(formatCurrency(1000.1)).toBe("$1,000");
  });

  it("should handle zero value", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("should handle negative values with sign before symbol", () => {
    expect(formatCurrency(-1000)).toBe("-$1,000");
    expect(formatCurrency(-50000)).toBe("-$50,000");
  });

  it("should handle large numbers", () => {
    expect(formatCurrency(1000000)).toBe("$1,000,000");
    expect(formatCurrency(1234567)).toBe("$1,234,567");
  });

  it("should handle small numbers", () => {
    expect(formatCurrency(1)).toBe("$1");
    expect(formatCurrency(99)).toBe("$99");
  });
});
