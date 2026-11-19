import { describe, expect, it } from "vitest";
import { formatDateToMonthYear } from "./format-date-to-month-year";

describe("formatDateToMonthYear", () => {
  it("should return the formatted dates correctly", () => {
    expect(formatDateToMonthYear("2024-01")).toBe("Jan 2024");
    expect(formatDateToMonthYear("2023-12")).toBe("Dec 2023");
    expect(formatDateToMonthYear("2025-06")).toBe("Jun 2025");
  });

  it("should handle undefined or empty inputs", () => {
    expect(formatDateToMonthYear("")).toBe("");
    expect(formatDateToMonthYear(undefined as any)).toBe("");
    expect(formatDateToMonthYear(null as any)).toBe("");
  });
});
