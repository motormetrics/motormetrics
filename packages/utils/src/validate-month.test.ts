import { describe, expect, it } from "vitest";
import { isValidMonth } from "./validate-month";

describe("isValidMonth", () => {
  it("should accept valid YYYY-MM formats", () => {
    expect(isValidMonth("2024-01")).toBe(true);
    expect(isValidMonth("2024-06")).toBe(true);
    expect(isValidMonth("2024-12")).toBe(true);
    expect(isValidMonth("2023-09")).toBe(true);
    expect(isValidMonth("2000-01")).toBe(true);
  });

  it("should reject invalid month values", () => {
    expect(isValidMonth("2024-00")).toBe(false);
    expect(isValidMonth("2024-13")).toBe(false);
    expect(isValidMonth("2024-99")).toBe(false);
  });

  it("should reject invalid formats", () => {
    expect(isValidMonth("invalid")).toBe(false);
    expect(isValidMonth("2024")).toBe(false);
    expect(isValidMonth("2024-1")).toBe(false);
    expect(isValidMonth("202-01")).toBe(false);
    expect(isValidMonth("2024/01")).toBe(false);
    expect(isValidMonth("01-2024")).toBe(false);
    expect(isValidMonth("")).toBe(false);
    expect(isValidMonth("2024-01-01")).toBe(false);
  });
});
