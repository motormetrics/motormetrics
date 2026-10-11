import {
  periodLabel,
  periodWindow,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import { describe, expect, it } from "vitest";

describe("periodWindow", () => {
  it("covers the selected month alone", () => {
    expect(periodWindow("2026-08", "month")).toEqual({
      end: "2026-08",
      start: "2026-08",
    });
  });

  it("runs from January for the year to date", () => {
    expect(periodWindow("2026-08", "ytd")).toEqual({
      end: "2026-08",
      start: "2026-01",
    });
  });

  it("spans twelve months for the rolling year", () => {
    expect(periodWindow("2026-08", "12m")).toEqual({
      end: "2026-08",
      start: "2025-09",
    });
  });
});

describe("periodLabel", () => {
  it("names a single month", () => {
    expect(periodLabel("2026-08", "month")).toBe("August 2026");
  });

  it("drops the start year when it matches the end", () => {
    expect(periodLabel("2026-08", "ytd")).toBe("January to August 2026");
  });

  it("keeps both years across a year boundary", () => {
    expect(periodLabel("2026-08", "12m")).toBe("September 2025 to August 2026");
  });
});
