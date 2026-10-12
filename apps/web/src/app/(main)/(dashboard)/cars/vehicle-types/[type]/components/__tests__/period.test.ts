import {
  periodRange,
  periodWindow,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { describe, expect, it } from "vitest";

describe("periodWindow", () => {
  it("should cover the selected month alone", () => {
    expect(periodWindow("month", "2026-08")).toEqual({
      from: "2026-08",
      to: "2026-08",
    });
  });

  it("should run from January for the year to date", () => {
    expect(periodWindow("ytd", "2026-08")).toEqual({
      from: "2026-01",
      to: "2026-08",
    });
  });

  it("should span twelve months back across the year end", () => {
    expect(periodWindow("12m", "2026-08")).toEqual({
      from: "2025-09",
      to: "2026-08",
    });
  });
});

describe("periodRange", () => {
  it("should name a single month", () => {
    expect(periodRange("month", "2026-08")).toBe("August 2026");
  });

  it("should drop the repeated year inside one year", () => {
    expect(periodRange("ytd", "2026-08")).toBe("January to August 2026");
  });

  it("should name January alone when the year to date is one month", () => {
    expect(periodRange("ytd", "2026-01")).toBe("January 2026");
  });

  it("should keep both years when the window crosses one", () => {
    expect(periodRange("12m", "2026-08")).toBe("September 2025 to August 2026");
  });
});
