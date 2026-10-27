import {
  makeOptions,
  selectMakes,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/components/selection";
import { describe, expect, it } from "vitest";

const KNOWN = ["audi", "bmw", "mercedes-benz"];

describe("selection", () => {
  it("should keep the given order of two valid slugs", () => {
    expect(selectMakes(["mercedes-benz", "bmw"], KNOWN)).toEqual([
      "mercedes-benz",
      "bmw",
    ]);
  });

  it("should lowercase and trim", () => {
    expect(selectMakes([" BMW ", "Audi"], KNOWN)).toEqual(["bmw", "audi"]);
  });

  it("should drop empty, unknown and duplicate slugs", () => {
    expect(
      selectMakes(["", "bmw", "unknown", "BMW", "  ", "audi"], KNOWN),
    ).toEqual(["bmw", "audi"]);
  });

  it("should take only the first two valid slugs", () => {
    expect(selectMakes(["audi", "bmw", "mercedes-benz"], KNOWN)).toEqual([
      "audi",
      "bmw",
    ]);
  });

  it("should return fewer than two when only one is valid", () => {
    expect(selectMakes(["bmw", "bmw"], KNOWN)).toEqual(["bmw"]);
    expect(selectMakes(["bmw", "unknown"], KNOWN)).toEqual(["bmw"]);
  });

  it("should return an empty array for no values", () => {
    expect(selectMakes([], KNOWN)).toEqual([]);
  });

  it("should slugify, sort by name and drop slug duplicates", () => {
    expect(
      makeOptions([
        { make: "MERCEDES BENZ" },
        { make: "BMW" },
        { make: "Mercedes-Benz" },
        { make: "AUDI" },
      ]),
    ).toEqual([
      { name: "AUDI", slug: "audi" },
      { name: "BMW", slug: "bmw" },
      { name: "MERCEDES BENZ", slug: "mercedes-benz" },
    ]);
  });
});
