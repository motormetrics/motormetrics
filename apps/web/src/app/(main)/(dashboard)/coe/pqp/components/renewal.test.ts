import {
  getApplicablePqp,
  getFirstCoeExpiry,
  getParfRebate,
  getRenewalCost,
  getRenewalPayment,
  getRenewalWindows,
  getVehicleHistory,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/renewal";
import type { Pqp } from "@web/types/coe";
import { describe, expect, it } from "vitest";

const date = (year: number, month: number, day: number) =>
  new Date(year, month - 1, day);

const rates: Pqp.TrendPoint[] = [
  {
    "Category A": 128715,
    "Category B": 131616,
    "Category C": 92614,
    "Category D": 11161,
    month: "2026-10",
  },
  {
    "Category A": 129883,
    "Category B": 131819,
    "Category C": 0,
    "Category D": 0,
    month: "2026-11",
  },
];

describe("getFirstCoeExpiry", () => {
  it("should expire the day before the 10th anniversary", () => {
    expect(getFirstCoeExpiry(date(2016, 12, 10))).toEqual(date(2026, 12, 9));
  });

  it("should handle a 1st-of-month registration", () => {
    expect(getFirstCoeExpiry(date(2017, 3, 1))).toEqual(date(2027, 2, 28));
  });
});

describe("getVehicleHistory", () => {
  it("should read a first COE from a 10-year gap", () => {
    expect(getVehicleHistory(date(2016, 12, 10), date(2026, 12, 9))).toEqual({
      ageAtExpiry: 10,
      mustDeregister: false,
      renewedBefore: false,
    });
  });

  it("should flag a 5-year renewal as final", () => {
    expect(getVehicleHistory(date(2011, 12, 10), date(2026, 12, 9))).toEqual({
      ageAtExpiry: 15,
      mustDeregister: true,
      renewedBefore: true,
    });
  });

  it("should read a 20-year gap as a 10-year renewal", () => {
    expect(getVehicleHistory(date(2006, 12, 10), date(2026, 12, 9))).toEqual({
      ageAtExpiry: 20,
      mustDeregister: false,
      renewedBefore: true,
    });
  });
});

describe("getParfRebate", () => {
  it("should pay 50% with no cap for a first COE from before February 2023", () => {
    const rebate = getParfRebate(date(2016, 12, 10), date(2026, 12, 9), 30000);
    expect(rebate).toMatchObject({
      amount: 15000,
      capped: false,
      newSchedule: false,
      rate: 0.5,
    });
    expect(rebate.cap).toBe(Number.POSITIVE_INFINITY);
  });

  it("should cap at S$60,000 for a COE from the 2nd February 2023 exercise", () => {
    const registration = date(2023, 3, 1);
    const rebate = getParfRebate(
      registration,
      getFirstCoeExpiry(registration),
      200000,
    );
    expect(rebate).toMatchObject({ amount: 60000, cap: 60000, capped: true });
  });

  it("should use the new schedule and S$30,000 cap after Budget 2026", () => {
    const registration = date(2026, 3, 1);
    const rebate = getParfRebate(
      registration,
      getFirstCoeExpiry(registration),
      100000,
    );
    expect(rebate).toMatchObject({
      amount: 5000,
      cap: 30000,
      newSchedule: true,
      rate: 0.05,
    });
  });

  it("should pick the bracket from the age at expiry", () => {
    // Deregistering at 7 years falls in "more than 6 to 7 years".
    expect(
      getParfRebate(date(2019, 12, 10), date(2026, 12, 9), 10000).rate,
    ).toBe(0.65);
  });

  it("should pay nothing once the COE has been renewed", () => {
    expect(
      getParfRebate(date(2006, 12, 10), date(2026, 12, 9), 30000).amount,
    ).toBe(0);
  });
});

describe("getApplicablePqp", () => {
  it("should use the published rate for the expiry month", () => {
    expect(getApplicablePqp(date(2026, 11, 20), "Category B", rates)).toEqual({
      estimated: false,
      month: "2026-11",
      rate: 131819,
    });
  });

  it("should estimate from the latest month when the expiry month is not out", () => {
    expect(getApplicablePqp(date(2026, 12, 9), "Category A", rates)).toEqual({
      estimated: true,
      month: "2026-12",
      rate: 129883,
    });
  });

  it("should return null for a month before the data starts", () => {
    expect(getApplicablePqp(date(2026, 9, 1), "Category A", [])).toBeNull();
  });
});

describe("getRenewalWindows", () => {
  it("should run early, expiry-month and late windows around the expiry", () => {
    expect(getRenewalWindows(date(2026, 12, 9))).toEqual({
      earlyPqpMonth: "2026-11",
      expiry: date(2026, 12, 9),
      lateUntil: date(2027, 1, 9),
    });
  });
});

describe("getRenewalPayment", () => {
  it("should charge the full PQP for 10 years and half, rounded up, for 5", () => {
    expect(getRenewalPayment(129883, 10)).toBe(129883);
    expect(getRenewalPayment(129883, 5)).toBe(64942);
  });
});

describe("getRenewalCost", () => {
  const roadTax = {
    engineCapacity: 1598,
    fuel: "petrol" as const,
    powerRating: 0,
  };

  it("should total the PQP, rebate given up and road tax over 10 years", () => {
    const cost = getRenewalCost({
      ageAtExpiry: 10,
      parfForgone: 15000,
      pqp: 129883,
      roadTax,
      term: 10,
    });
    // Road tax S$741.73 a year for 10 years plus 400% surcharge.
    expect(cost.roadTax).toBeCloseTo(7417.27, 1);
    expect(cost.roadTaxSurcharge).toBeCloseTo(2966.91, 1);
    expect(cost.total).toBeCloseTo(155267.18, 1);
    expect(cost.perYear).toBeCloseTo(15526.72, 1);
    expect(cost.perMonth).toBeCloseTo(1293.89, 1);
  });

  it("should spread a 5-year renewal over 5 years", () => {
    const cost = getRenewalCost({
      ageAtExpiry: 10,
      parfForgone: 15000,
      pqp: 129883,
      roadTax,
      term: 5,
    });
    expect(cost.payment).toBe(64942);
    expect(cost.perYear).toBeCloseTo(16952.65, 1);
  });

  it("should add the electric flat component without surcharging it", () => {
    const cost = getRenewalCost({
      ageAtExpiry: 10,
      parfForgone: 0,
      pqp: 100000,
      roadTax: { engineCapacity: 0, fuel: "electric", powerRating: 100 },
      term: 10,
    });
    expect(cost.roadTaxExtra).toBe(7000);
    expect(cost.roadTaxSurcharge).toBeCloseTo(cost.roadTax * 0.4, 5);
  });
});
