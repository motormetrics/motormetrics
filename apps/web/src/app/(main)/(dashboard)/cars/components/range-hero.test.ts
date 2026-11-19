import {
  changeLabel,
  rangeSummary,
} from "@web/app/(main)/(dashboard)/cars/components/range-hero";

describe("rangeSummary", () => {
  it("should name the high when the current value is the highest", () => {
    expect(rangeSummary([10, 20, 30], 30, "12 months")).toEqual({
      current: 30,
      high: 30,
      low: 10,
      where: "Highest in 12 months",
    });
  });

  it("should name the low when the current value is the lowest", () => {
    expect(rangeSummary([10, 20, 30], 10, "20 years")?.where).toBe(
      "Lowest in 20 years",
    );
  });

  it("should give the distance below the high otherwise", () => {
    expect(rangeSummary([4000, 6390, 4549], 4549, "12 months")?.where).toBe(
      "28.8% below the high",
    );
  });

  it("should return null for an empty window", () => {
    expect(rangeSummary([], 10, "12 months")).toBeNull();
  });
});

describe("changeLabel", () => {
  it("should sign a fall with a true minus", () => {
    expect(changeLabel(4549, 4953, "July")).toBe("−8.2% · −404 vs July");
  });

  it("should sign a rise with a plus", () => {
    expect(changeLabel(1100, 1000, "2024")).toBe("+10.0% · +100 vs 2024");
  });

  it("should show a dash when there is no base", () => {
    expect(changeLabel(5, 0, "July")).toBe("— · +5 vs July");
  });
});
