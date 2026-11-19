import { describe, expect, it } from "vitest";
import { formatCount } from "./format-count";

describe("formatCount", () => {
  it("should return the number as string when below 1000", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(999)).toBe("999");
    expect(formatCount(1)).toBe("1");
  });

  it("should format values >= 1000 with K suffix", () => {
    expect(formatCount(1000)).toBe("1.0K");
    expect(formatCount(1500)).toBe("1.5K");
    expect(formatCount(10000)).toBe("10.0K");
    expect(formatCount(99999)).toBe("100.0K");
  });

  it("should round to 1 decimal place", () => {
    expect(formatCount(1234)).toBe("1.2K");
    expect(formatCount(1250)).toBe("1.3K");
  });
});
