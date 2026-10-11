import {
  defaultMixDirection,
  type MixRow,
  sortMixRows,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/mix-rows";
import { describe, expect, it } from "vitest";

const rows: MixRow[] = [
  { change: -20, count: 40, fuelType: "Petrol", rank: 1, vehicleType: "SUV" },
  {
    change: 15,
    count: 30,
    fuelType: "Electric",
    rank: 2,
    vehicleType: "Sedan",
  },
  {
    change: 5,
    count: 10,
    fuelType: "Petrol-Electric",
    rank: 3,
    vehicleType: "Hatchback",
  },
];

describe("sortMixRows", () => {
  it("orders by registrations, largest first", () => {
    expect(sortMixRows(rows, "count", "desc").map((row) => row.rank)).toEqual([
      1, 2, 3,
    ]);
  });

  it("orders by change in either direction", () => {
    expect(sortMixRows(rows, "change", "asc").map((row) => row.rank)).toEqual([
      1, 3, 2,
    ]);
  });

  it("orders text columns alphabetically", () => {
    expect(
      sortMixRows(rows, "vehicleType", "asc").map((row) => row.vehicleType),
    ).toEqual(["Hatchback", "Sedan", "SUV"]);
  });

  it("leaves the input untouched", () => {
    sortMixRows(rows, "count", "asc");
    expect(rows[0].rank).toBe(1);
  });
});

describe("defaultMixDirection", () => {
  it("opens text columns A to Z and figures largest first", () => {
    expect(defaultMixDirection("fuelType")).toBe("asc");
    expect(defaultMixDirection("change")).toBe("desc");
  });
});
