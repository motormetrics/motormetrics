import { buildCompareFaqs } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/faq-data";
import type { MakeFigures } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/figures";
import { describe, expect, it } from "vitest";

const figures = (overrides: Partial<MakeFigures>): MakeFigures => ({
  change: null,
  electric: 0,
  fuelCounts: new Map(),
  previous: 0,
  series: [],
  vehicleCounts: new Map(),
  ytd: 0,
  ...overrides,
});

const bmw = figures({
  change: -30.4,
  electric: 840,
  fuelCounts: new Map([
    ["Electric", 840],
    ["Petrol", 968],
  ]),
  ytd: 2218,
});
const mercedes = figures({
  change: -26.04,
  electric: 444,
  fuelCounts: new Map([
    ["Electric", 444],
    ["Petrol-Electric", 2049],
  ]),
  ytd: 2541,
});

const comparison = {
  a: bmw,
  b: mercedes,
  month: "2026-09",
  nameA: "BMW",
  nameB: "MERCEDES BENZ",
};

describe("buildCompareFaqs", () => {
  it("should answer which sells more with both totals and both changes", () => {
    const [first] = buildCompareFaqs(comparison);

    expect(first.question).toBe(
      "Which sells more in Singapore, BMW or MERCEDES BENZ?",
    );
    expect(first.answer).toBe(
      "MERCEDES BENZ registered 2,541 new cars in Singapore from January to September 2026, 323 more than BMW (2,218). Against the same months of 2025, MERCEDES BENZ was down 26.0% and BMW was down 30.4%.",
    );
  });

  it("should answer which sells more electric cars with the other make's largest fuel type", () => {
    const [, second] = buildCompareFaqs(comparison);

    expect(second.answer).toBe(
      "BMW registered more fully electric cars: 840 (37.9% of its total) against 444 (17.5%) for MERCEDES BENZ, whose largest fuel type is Petrol-Electric at 80.6%.",
    );
  });

  it("should word a tie and a missing baseline explicitly", () => {
    const [first, second] = buildCompareFaqs({
      ...comparison,
      a: { ...bmw, change: null, electric: 444, ytd: 2541 },
    });

    expect(first.answer).toBe(
      "BMW and MERCEDES BENZ each registered 2,541 new cars in Singapore from January to September 2026. Against the same months of 2025, BMW had no registrations a year earlier and MERCEDES BENZ was down 26.0%.",
    );
    expect(second.answer).toBe(
      "Neither: BMW and MERCEDES BENZ each registered 444 fully electric cars, 17.5% of BMW’s total and 17.5% of MERCEDES BENZ’s.",
    );
  });

  it("should name the single baseline month in January", () => {
    const [first] = buildCompareFaqs({ ...comparison, month: "2026-01" });

    expect(first.answer).toBe(
      "MERCEDES BENZ registered 2,541 new cars in Singapore in January 2026, 323 more than BMW (2,218). Against January 2025, MERCEDES BENZ was down 26.0% and BMW was down 30.4%.",
    );
  });

  it("should say how far the data runs", () => {
    expect(buildCompareFaqs(comparison)[3].answer).toContain(
      "These figures run to September 2026.",
    );
  });
});
