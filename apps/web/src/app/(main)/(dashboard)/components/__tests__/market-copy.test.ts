import {
  coeCaption,
  fuelCaption,
  leadSentence,
  makesCaption,
  pqpCaption,
  rangeWhere,
  roadCaption,
  signed,
} from "@web/app/(main)/(dashboard)/components/market-copy";
import { describe, expect, it } from "vitest";

describe("signed", () => {
  it("should prefix a plus or a true minus", () => {
    expect(signed(5.25)).toBe("+5.3%");
    expect(signed(-0.4)).toBe("−0.4%");
    expect(signed(-5.5, " pts")).toBe("−5.5 pts");
  });
});

describe("rangeWhere", () => {
  it("should name the high and the low", () => {
    expect(rangeWhere(139001, 100000, 139001, 24)).toBe(
      "Highest in 24 exercises",
    );
    expect(rangeWhere(100000, 100000, 139001, 24)).toBe(
      "Lowest in 24 exercises",
    );
  });

  it("should give the distance below the high otherwise", () => {
    expect(rangeWhere(90, 50, 100, 24)).toBe("10.0% below the high");
  });
});

describe("leadSentence", () => {
  const series = [
    { month: "2026-01", total: 4000 },
    { month: "2026-02", total: 3900 },
    { month: "2026-03", total: 5000 },
    { month: "2026-04", total: 4800 },
    { month: "2026-05", total: 4500 },
    { month: "2026-06", total: 3950 },
  ];

  it("should give the change, the look-back and the electric share", () => {
    expect(leadSentence(series, 59.6)).toBe(
      "June's 3,950 new cars were 12.2% fewer than May's, the fewest since February 2026, and battery-electric cars were 59.6% of them.",
    );
  });

  it("should leave out a look-back that is too short", () => {
    expect(leadSentence(series.slice(0, 3))).toBe(
      "March's 5,000 new cars were 28.2% more than February's.",
    );
  });

  it("should return null for an empty series", () => {
    expect(leadSentence([])).toBeNull();
  });
});

describe("coeCaption", () => {
  const move = (key: string, change: number) => ({
    change,
    isHigh: false,
    isLow: false,
    key,
    premium: 100000,
  });

  it("should call small moves flat", () => {
    expect(
      coeCaption(
        [
          { ...move("A", 5.3), isHigh: true, premium: 139001 },
          move("B", 0.3),
          move("E", -0.5),
        ],
        24,
      ),
    ).toBe(
      "Category A rose 5.3% to $139,001, the highest of the 24 exercises shown; Categories B to E each moved by less than 1%.",
    );
  });

  it("should name the largest other mover", () => {
    expect(coeCaption([move("A", -2), move("B", 1.5), move("D", -4)], 24)).toBe(
      "Category A fell 2.0% to $100,000; of the others, Category D moved most, −4.0%.",
    );
  });
});

describe("pqpCaption", () => {
  it("should give Category A's rate and the largest mover", () => {
    expect(
      pqpCaption(
        [
          { change: 0.9, key: "A", rate: 129883 },
          { change: 0.2, key: "B", rate: 131819 },
          { change: 4.5, key: "D", rate: 10366 },
        ],
        "2026-11",
        "2026-10",
      ),
    ).toBe(
      "Renewing a Category A COE for 10 years costs $129,883 in November, 0.9% more than in October; Category D moved most, +4.5%. LTA publishes no PQP for Category E.",
    );
  });
});

describe("fuelCaption", () => {
  it("should compare the electric share with the month before", () => {
    expect(
      fuelCaption({
        electric: 59.6,
        month: "2026-10",
        petrol: 5.3,
        previous: { electric: 65.1, month: "2026-09" },
        total: 4202,
      }),
    ).toBe(
      "Electric cars were 59.6% of October's 4,202 registrations, down from 65.1% in September; petrol-only cars were 5.3%.",
    );
  });
});

describe("makesCaption", () => {
  it("should say more than twice when the leader doubles the next make", () => {
    expect(
      makesCaption(
        [
          { count: 11247, make: "BMW", share: 24.9 },
          { count: 5278, make: "Audi", share: 11.7 },
        ],
        "January to October 2026",
      ),
    ).toBe(
      "BMW registered 11,247 cars from January to October 2026, 24.9% of the market and more than twice Audi's 5,278.",
    );
  });

  it("should say ahead of otherwise", () => {
    expect(
      makesCaption(
        [
          { count: 900, make: "BMW", share: 20 },
          { count: 800, make: "Mercedes-Benz", share: 18 },
        ],
        "January 2026",
      ),
    ).toContain("ahead of Mercedes-Benz's 800");
  });
});

describe("roadCaption", () => {
  it("should share out the month and quote the population", () => {
    expect(
      roadCaption({
        deregistered: [
          { count: 600, label: "Category A" },
          { count: 300, label: "Category B" },
          { count: 100, label: "Taxis" },
        ],
        month: "2026-10",
        population: { label: "Petrol", share: 65, year: "2025" },
      }),
    ).toBe(
      "Category A made up 60.0% of the 1,000 vehicles deregistered in October 2026 and Category B a further 30.0%. Petrol vehicles were 65.0% of those on the road at the end of 2025.",
    );
  });

  it("should return null without deregistrations", () => {
    expect(roadCaption({ deregistered: [], month: "2026-10" })).toBeNull();
  });
});
