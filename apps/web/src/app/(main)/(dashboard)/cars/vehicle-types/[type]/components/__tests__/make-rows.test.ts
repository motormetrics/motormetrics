import {
  defaultMakeDirection,
  type MakeRow,
  sortMakeRows,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/make-rows";
import { describe, expect, it } from "vitest";

const rows: MakeRow[] = [
  { change: 40, count: 300, logoUrl: null, make: "BYD", rank: 1 },
  { change: -20, count: 120, logoUrl: null, make: "BMW", rank: 2 },
  { change: 5, count: 60, logoUrl: null, make: "Audi", rank: 3 },
];

describe("sortMakeRows", () => {
  it("should order by registrations, largest first", () => {
    expect(sortMakeRows(rows, "count", "desc").map((row) => row.rank)).toEqual([
      1, 2, 3,
    ]);
  });

  it("should order by change in either direction", () => {
    expect(sortMakeRows(rows, "change", "desc").map((row) => row.make)).toEqual(
      ["BYD", "Audi", "BMW"],
    );
    expect(sortMakeRows(rows, "change", "asc").map((row) => row.make)).toEqual([
      "BMW",
      "Audi",
      "BYD",
    ]);
  });

  it("should order makes alphabetically", () => {
    expect(sortMakeRows(rows, "make", "asc").map((row) => row.make)).toEqual([
      "Audi",
      "BMW",
      "BYD",
    ]);
  });

  it("should leave the input untouched", () => {
    sortMakeRows(rows, "make", "asc");
    expect(rows.map((row) => row.rank)).toEqual([1, 2, 3]);
  });
});

describe("defaultMakeDirection", () => {
  it("should open the make column A to Z and figures largest first", () => {
    expect(defaultMakeDirection("make")).toBe("asc");
    expect(defaultMakeDirection("count")).toBe("desc");
    expect(defaultMakeDirection("change")).toBe("desc");
  });
});
