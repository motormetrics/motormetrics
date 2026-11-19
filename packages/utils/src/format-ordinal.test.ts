import { describe, expect, it } from "vitest";
import { formatOrdinal } from "./format-ordinal";

describe("formatOrdinal", () => {
  it("should format basic ordinals correctly", () => {
    expect(formatOrdinal(1)).toBe("1st");
    expect(formatOrdinal(2)).toBe("2nd");
    expect(formatOrdinal(3)).toBe("3rd");
    expect(formatOrdinal(4)).toBe("4th");
  });

  it("should format teen numbers correctly", () => {
    expect(formatOrdinal(11)).toBe("11th");
    expect(formatOrdinal(13)).toBe("13th");
  });

  it("should format larger numbers correctly", () => {
    expect(formatOrdinal(21)).toBe("21st");
    expect(formatOrdinal(102)).toBe("102nd");
  });

  it("should format zero correctly", () => {
    expect(formatOrdinal(0)).toBe("0th");
  });
});
