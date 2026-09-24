import { shiftMonth, trailingMonths } from "@web/utils/dates/month-arithmetic";
import { describe, expect, it } from "vitest";

describe("shiftMonth", () => {
  it("steps forward and backward within a year", () => {
    expect(shiftMonth("2025-04", 2)).toBe("2025-06");
    expect(shiftMonth("2025-04", -2)).toBe("2025-02");
  });

  it("rolls over year boundaries in both directions", () => {
    expect(shiftMonth("2025-01", -1)).toBe("2024-12");
    expect(shiftMonth("2024-12", 1)).toBe("2025-01");
    expect(shiftMonth("2025-06", -11)).toBe("2024-07");
  });
});

describe("trailingMonths", () => {
  it("returns the months ending at the given month, oldest first", () => {
    const months = trailingMonths("2025-03", 12);

    expect(months).toHaveLength(12);
    expect(months[0]).toBe("2024-04");
    expect(months.at(-1)).toBe("2025-03");
  });
});
