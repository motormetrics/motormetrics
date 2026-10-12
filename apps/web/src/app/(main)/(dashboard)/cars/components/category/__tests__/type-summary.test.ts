import {
  summariseMix,
  summariseType,
} from "@web/app/(main)/(dashboard)/cars/components/category/type-summary";
import { describe, expect, it } from "vitest";

describe("summariseMix", () => {
  it("should name the three largest types, largest first", () => {
    expect(
      summariseMix("September 2026", [
        { label: "Petrol", share: 19.1 },
        { label: "Diesel", share: 0.4 },
        { label: "Petrol-Electric", share: 48.2 },
        { label: "Electric", share: 31 },
      ]),
    ).toBe(
      "September 2026: Petrol-Electric took 48.2% of new cars, Electric 31.0% and Petrol 19.1%.",
    );
  });

  it("should join two types with and", () => {
    expect(
      summariseMix("2026 year to date", [
        { label: "SUV", share: 60 },
        { label: "Sedan", share: 40 },
      ]),
    ).toBe("2026 year to date: SUV took 60.0% of new cars and Sedan 40.0%.");
  });

  it("should end after a single type", () => {
    expect(summariseMix("August 2026", [{ label: "SUV", share: 100 }])).toBe(
      "August 2026: SUV took 100.0% of new cars.",
    );
  });

  it("should return undefined when there are no rows", () => {
    expect(summariseMix("August 2026", [])).toBeUndefined();
  });
});

describe("summariseType", () => {
  const base = {
    count: 12_340,
    label: "Electric",
    periodLabel: "2026 year to date",
    share: 31,
  };

  it("should report a rise in share against a year earlier", () => {
    expect(summariseType({ ...base, previousShare: 24 })).toBe(
      "2026 year to date: 12,340 Electric registrations, 31.0% of new cars, up from 24.0% a year earlier.",
    );
  });

  it("should report a fall in share against a year earlier", () => {
    expect(summariseType({ ...base, previousShare: 35.3 })).toBe(
      "2026 year to date: 12,340 Electric registrations, 31.0% of new cars, down from 35.3% a year earlier.",
    );
  });

  it("should call a share unchanged when both round to the same figure", () => {
    expect(summariseType({ ...base, previousShare: 31.04 })).toBe(
      "2026 year to date: 12,340 Electric registrations, 31.0% of new cars, unchanged from a year earlier.",
    );
  });

  it("should drop the comparison without a year-earlier share", () => {
    expect(summariseType(base)).toBe(
      "2026 year to date: 12,340 Electric registrations, 31.0% of new cars.",
    );
  });
});
