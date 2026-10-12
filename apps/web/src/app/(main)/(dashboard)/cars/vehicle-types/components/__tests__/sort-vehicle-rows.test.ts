import {
  sortVehicleRows,
  type VehicleRow,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/sort-vehicle-rows";
import { describe, expect, it } from "vitest";

const row = (
  label: string,
  count: number,
  change: number,
  electric: number | null,
): VehicleRow => ({
  change,
  color: "var(--chart-1)",
  count,
  description: "",
  electric,
  label,
  name: label,
  share: 0,
});

const rows = [
  row("SUV", 2951, 9.1, 73.1),
  row("MPV", 730, -5.1, null),
  row("Sedan", 581, -2.7, 63.5),
];

const labels = (sorted: VehicleRow[]) => sorted.map(({ label }) => label);

describe("sortVehicleRows", () => {
  it("should sort by count, largest first", () => {
    expect(labels(sortVehicleRows(rows, "count", "descending"))).toEqual([
      "SUV",
      "MPV",
      "Sedan",
    ]);
  });

  it("should sort by change in either direction", () => {
    expect(labels(sortVehicleRows(rows, "change", "ascending"))).toEqual([
      "MPV",
      "Sedan",
      "SUV",
    ]);
  });

  it("should sort a type without an electric split lowest", () => {
    expect(labels(sortVehicleRows(rows, "electric", "descending"))).toEqual([
      "SUV",
      "Sedan",
      "MPV",
    ]);
  });

  it("should sort by label alphabetically", () => {
    expect(labels(sortVehicleRows(rows, "label", "ascending"))).toEqual([
      "MPV",
      "Sedan",
      "SUV",
    ]);
  });

  it("should not reorder the rows it was given", () => {
    sortVehicleRows(rows, "label", "descending");
    expect(labels(rows)).toEqual(["SUV", "MPV", "Sedan"]);
  });
});
