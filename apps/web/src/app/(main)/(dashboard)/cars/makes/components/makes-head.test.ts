import type { MakeRow } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { leadSentence } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-head";

const row = (make: string, count: number, share: number): MakeRow => ({
  count,
  logoUrl: null,
  make,
  rank: 0,
  share,
  slug: make.toLowerCase(),
  trend: [],
  yoyChange: null,
});

describe("leadSentence", () => {
  it("should name the two makes behind the leader and count the long tail", () => {
    const rows = [
      row("BYD", 11247, 24.9),
      row("Toyota", 5287, 11.7),
      row("Tesla", 4474, 9.9),
      row("Lotus", 6, 0),
    ];

    expect(leadSentence(rows, "January to October 2026")).toBe(
      "Toyota (11.7%) and Tesla (9.9%) followed BYD from January to October 2026, and 1 of the 4 makes registered fewer than 100 cars each.",
    );
  });

  it("should fall back to the leader alone when fewer than three makes registered", () => {
    expect(leadSentence([row("BYD", 120, 100)], "March 2026")).toBe(
      "BYD led from March 2026, and 0 of the 1 makes registered fewer than 100 cars each.",
    );
  });

  it("should return null when no make registered", () => {
    expect(leadSentence([], "March 2026")).toBeNull();
  });
});
