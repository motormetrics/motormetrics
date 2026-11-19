import {
  fuelShareRows,
  vehicleShareRows,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/mix-rows";
import { describe, expect, it } from "vitest";

const make = (
  ytd: number,
  fuel: Record<string, number>,
  vehicle: Record<string, number> = {},
) => ({
  fuelCounts: new Map(Object.entries(fuel)),
  vehicleCounts: new Map(Object.entries(vehicle)),
  ytd,
});

describe("fuelShareRows", () => {
  it("should gloss the four LTA fuel types and hide an empty Other row", () => {
    const rows = fuelShareRows(
      make(100, { Electric: 40, Petrol: 60 }),
      make(200, { "Petrol-Electric": 150, Petrol: 50 }),
    );

    expect(
      rows.map((row) => [row.label, row.gloss, row.a, row.b, row.leader]),
    ).toEqual([
      ["Electric", "Battery electric", "40.0%", "0.0%", "a"],
      ["Petrol-Electric", "Hybrid", "0.0%", "75.0%", "b"],
      ["Petrol-Electric (Plug-In)", "Plug-in hybrid", "0.0%", "0.0%", null],
      ["Petrol", "Petrol only", "60.0%", "25.0%", "a"],
    ]);
  });

  it("should roll other fuel types into an Other row when present", () => {
    const rows = fuelShareRows(
      make(100, { Diesel: 10, "Diesel-Electric": 5, Petrol: 85 }),
      make(100, { Petrol: 100 }),
    );

    expect(rows.at(-1)).toMatchObject({
      a: "15.0%",
      b: "0.0%",
      label: "Other",
    });
  });
});

describe("vehicleShareRows", () => {
  it("should split SUV, Sedan and Other, and break Other down largest first", () => {
    const { otherBreakdown, rows } = vehicleShareRows(
      make(
        100,
        {},
        {
          Hatchback: 10,
          "Multi-purpose Vehicle": 5,
          "Multi-purpose Vehicle/Station-wagon": 10,
          Sedan: 25,
          "Sports Utility Vehicle": 50,
        },
      ),
      make(
        100,
        {},
        { "Coupe/ Convertible": 0, Sedan: 60, "Sports Utility Vehicle": 40 },
      ),
    );

    expect(rows.map((row) => [row.label, row.a, row.b])).toEqual([
      ["SUV", "50.0%", "40.0%"],
      ["Sedan", "25.0%", "60.0%"],
      ["Other", "25.0%", "0.0%"],
    ]);
    expect(otherBreakdown.map((row) => [row.label, row.a])).toEqual([
      ["MPV", "15.0%"],
      ["Hatchback", "10.0%"],
    ]);
  });

  it("should give no leader on a tie", () => {
    const { rows } = vehicleShareRows(
      make(10, {}, { Sedan: 5 }),
      make(20, {}, { Sedan: 10 }),
    );

    expect(rows[1].leader).toBeNull();
  });
});
