import { comparableChange } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-index";
import { rangeTabLabel } from "@web/app/(main)/(dashboard)/cars/makes/components/range-tabs";

describe("comparableChange", () => {
  it("should keep a change on a base of 20 cars or more", () => {
    expect(comparableChange({ count: 1200, yoyChange: 20 })).toBe(20);
    expect(comparableChange({ count: 800, yoyChange: -20 })).toBe(-20);
  });

  it("should withhold the change when the year-earlier base was under 20", () => {
    expect(comparableChange({ count: 30, yoyChange: 200 })).toBeNull();
  });

  it("should give none when there is no year-earlier base", () => {
    expect(comparableChange({ count: 30, yoyChange: null })).toBeNull();
  });
});

describe("rangeTabLabel", () => {
  it("should label the periods as Direction D does", () => {
    expect(rangeTabLabel("month", "2026-10")).toBe("October");
    expect(rangeTabLabel("ytd", "2026-10")).toBe("2026 to date");
    expect(rangeTabLabel("12m", "2026-10")).toBe("12 months");
  });
});
