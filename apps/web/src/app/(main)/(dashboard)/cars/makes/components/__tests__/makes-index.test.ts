import { changeLabel } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-index";
import { rangeTabLabel } from "@web/app/(main)/(dashboard)/cars/makes/components/range-tabs";

describe("changeLabel", () => {
  it("should compare the year to date against the previous year", () => {
    expect(changeLabel({ count: 1200, yoyChange: 20 }, "ytd", "2026-10")).toBe(
      "+20.0% on 2025",
    );
  });

  it("should use a true minus for a fall", () => {
    expect(changeLabel({ count: 800, yoyChange: -20 }, "12m", "2026-10")).toBe(
      "−20.0% on a year earlier",
    );
  });

  it("should withhold the change when the year-earlier base was under 20", () => {
    expect(changeLabel({ count: 30, yoyChange: 200 }, "ytd", "2026-10")).toBe(
      "base under 20",
    );
  });

  it("should say when there is no year-earlier base", () => {
    expect(changeLabel({ count: 30, yoyChange: null }, "ytd", "2026-10")).toBe(
      "no 2025 base",
    );
  });
});

describe("rangeTabLabel", () => {
  it("should label the periods as Direction D does", () => {
    expect(rangeTabLabel("month", "2026-10")).toBe("October");
    expect(rangeTabLabel("ytd", "2026-10")).toBe("2026 to date");
    expect(rangeTabLabel("12m", "2026-10")).toBe("12 months");
  });
});
