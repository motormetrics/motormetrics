import {
  type FuelRow,
  sortFuelRows,
} from "@web/app/(main)/(dashboard)/cars/fuel-types/components/sort-fuel-rows";
import { describe, expect, it } from "vitest";

const row = (name: string, count: number, change: number): FuelRow => ({
  change,
  color: "var(--chart-1)",
  count,
  description: "",
  name,
  share: 0,
});

const rows = [
  row("Electric", 2880, 19.1),
  row("Petrol-Electric", 1134, -13.9),
  row("Petrol", 247, -7.9),
];

const names = (sorted: FuelRow[]) => sorted.map(({ name }) => name);

describe("sortFuelRows", () => {
  it("should sort by count, largest first", () => {
    expect(names(sortFuelRows(rows, "count", "descending"))).toEqual([
      "Electric",
      "Petrol-Electric",
      "Petrol",
    ]);
  });

  it("should sort by change in either direction", () => {
    expect(names(sortFuelRows(rows, "change", "ascending"))).toEqual([
      "Petrol-Electric",
      "Petrol",
      "Electric",
    ]);
  });

  it("should sort by name alphabetically", () => {
    expect(names(sortFuelRows(rows, "name", "ascending"))).toEqual([
      "Electric",
      "Petrol",
      "Petrol-Electric",
    ]);
  });

  it("should not reorder the rows it was given", () => {
    sortFuelRows(rows, "name", "descending");
    expect(names(rows)).toEqual(["Electric", "Petrol-Electric", "Petrol"]);
  });
});
