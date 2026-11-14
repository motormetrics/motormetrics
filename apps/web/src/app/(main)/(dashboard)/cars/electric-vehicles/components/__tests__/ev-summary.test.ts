import {
  chargingCaption,
  evLeadSentence,
  formatPoints,
  makesCaption,
  mixCaption,
  shareRange,
  trendCaption,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-summary";
import { describe, expect, it } from "vitest";

describe("formatPoints", () => {
  it("should sign the change with a true minus", () => {
    expect(formatPoints(1.24)).toBe("+1.2 pts");
    expect(formatPoints(-0.4)).toBe("−0.4 pts");
  });
});

describe("shareRange", () => {
  const shares = [40, 50, 60, 55];

  it("should place the share between the window's low and high", () => {
    expect(shareRange(shares, 3, 12)).toEqual({
      count: 4,
      high: 60,
      latest: 55,
      low: 40,
      where: "5.0 pts below the high",
    });
  });

  it("should only reach back as far as the window", () => {
    expect(shareRange(shares, 3, 2)).toMatchObject({
      count: 2,
      low: 55,
      where: "Lowest in 2 months",
    });
    expect(shareRange(shares, 2, 12)?.where).toBe("Highest in 3 months");
  });

  it("should return null for the first month", () => {
    expect(shareRange(shares, 0, 12)).toBeNull();
  });
});

describe("evLeadSentence", () => {
  it("should give the battery-electric count, share and electrified share", () => {
    expect(
      evLeadSentence({
        batteryElectric: 2880,
        electrifiedShare: 94.56,
        month: "2026-08",
        share: 63.31,
        total: 4549,
      }),
    ).toBe(
      "2,880 battery-electric cars were registered in August 2026, 63.3% of 4,549 new cars; with hybrids and plug-in hybrids, electrified cars were 94.6%.",
    );
  });
});

describe("mixCaption", () => {
  const segment = (label: string, share: number) => ({
    colour: "",
    label,
    share,
    value: 0,
  });

  it("should read the split in the comp's order", () => {
    expect(
      mixCaption(
        [
          segment("Battery-electric", 63.3),
          segment("Plug-in hybrid", 6.3),
          segment("Hybrid", 24.9),
          segment("Petrol and diesel", 5.5),
        ],
        "2026-08",
        4549,
      ),
    ).toBe(
      "Battery-electric cars were 63.3% of August's 4,549 new cars, hybrids 24.9% and plug-in hybrids 6.3%; petrol and diesel cars made up the other 5.5%.",
    );
  });

  it("should return null for an incomplete split", () => {
    expect(mixCaption([], "2026-08", 0)).toBeNull();
  });
});

describe("trendCaption", () => {
  it("should name a high inside the range", () => {
    expect(
      trendCaption(
        [
          { month: "2026-06", value: 100 },
          { month: "2026-07", value: 300 },
          { month: "2026-08", value: 200 },
        ],
        "Hybrid",
      ),
    ).toBe(
      "Hybrid registrations went from 100 in June 2026 to 200 in August 2026, with a high of 300 in July 2026.",
    );
  });

  it("should say when the latest month is the high", () => {
    expect(
      trendCaption(
        [
          { month: "2026-07", value: 100 },
          { month: "2026-08", value: 200 },
        ],
        "Electrified",
      ),
    ).toMatch(/the highest in the range\.$/);
  });
});

describe("makesCaption", () => {
  it("should compare the two leading makes and give the share range", () => {
    expect(
      makesCaption(
        [
          { count: 8000, make: "BMW" },
          { count: 4000, make: "Audi" },
        ],
        "2026-08",
        [55.2, 70.1, 63.3],
      ),
    ).toBe(
      "BMW registered 8,000 battery-electric cars in 2026 to August, 2.0 times Audi's 4,000; EV share ranged from 55.2% to 70.1% in the 3 months to August.",
    );
  });

  it("should return null without makes or shares", () => {
    expect(makesCaption([], "2026-08", [])).toBeNull();
  });
});

describe("chargingCaption", () => {
  it("should set the network against the 2030 target", () => {
    expect(chargingCaption(12000, 60000, "$25,000")).toBe(
      "There were 12,000 public charging points, 20.0% of the 60,000 targeted for 2030; the VES bands most EVs qualify for carry rebates of up to $25,000.",
    );
  });

  it("should leave out the network before it is ingested", () => {
    expect(chargingCaption(0, 60000, "$25,000")).toBe(
      "The VES bands most EVs qualify for carry rebates of up to $25,000.",
    );
  });
});
