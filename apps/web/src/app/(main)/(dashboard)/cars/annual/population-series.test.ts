import {
  buildPopulationSeries,
  changeRatio,
  type PopulationRow,
  rankClasses,
  sortClasses,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { describe, expect, it } from "vitest";

const rows: PopulationRow[] = [
  { fuelType: "Petrol", name: "Cars", total: 500, year: "2024" },
  { fuelType: "Electric", name: "Cars", total: 50, year: "2024" },
  { fuelType: "Petrol", name: "Cars", total: 520, year: "2025" },
  { fuelType: "Electric", name: "Cars", total: 100, year: "2025" },
  { fuelType: "Petrol", name: "Motorcycles", total: 140, year: "2024" },
  { fuelType: "Petrol", name: "Motorcycles", total: 130, year: "2025" },
  { fuelType: "Diesel", name: "Trishaws", total: 3, year: "2024" },
];

describe("buildPopulationSeries", () => {
  it("should return null for an empty dataset", () => {
    expect(buildPopulationSeries([])).toBeNull();
  });

  it("should pivot the rows into a series per class, largest first", () => {
    const series = buildPopulationSeries(rows);

    expect(series?.years).toEqual(["2024", "2025"]);
    expect(series?.year).toBe("2025");
    expect(series?.previousYear).toBe("2024");
    expect(series?.entities.map((entity) => entity.name)).toEqual([
      "Cars",
      "Motorcycles",
    ]);
    expect(series?.entities[0]).toMatchObject({
      electric: [50, 100],
      series: [550, 620],
    });
  });

  it("should split the latest year's fuel with the year before beside it", () => {
    const series = buildPopulationSeries(rows);

    expect(series?.entities[0].fuel).toEqual([
      { label: "Petrol", previous: 500, value: 520 },
      { label: "Electric", previous: 50, value: 100 },
    ]);
  });

  it("should drop a class that has left the road", () => {
    const series = buildPopulationSeries(rows);

    expect(
      series?.entities.find((entity) => entity.name === "Trishaws"),
    ).toBeUndefined();
  });
});

describe("changeRatio", () => {
  it("should compare the last two years", () => {
    expect(changeRatio([100, 110])).toBeCloseTo(0.1);
  });

  it("should return null without a prior year", () => {
    expect(changeRatio([100])).toBeNull();
    expect(changeRatio([0, 100])).toBeNull();
  });
});

describe("rankClasses", () => {
  it("should colour by rank and share out the whole fleet", () => {
    const series = buildPopulationSeries(rows);
    const ranked = rankClasses(series?.entities ?? []);

    expect(ranked[0]).toMatchObject({
      colour: "var(--chart-1)",
      name: "Cars",
      population: 620,
    });
    expect(ranked[0].share).toBeCloseTo((620 / 750) * 100);
    expect(ranked[1].colour).toBe("var(--chart-2)");
  });
});

describe("sortClasses", () => {
  const ranked = [
    { change: 0.02, colour: "a", name: "Cars", population: 620, share: 80 },
    { change: null, colour: "b", name: "Buses", population: 20, share: 5 },
    { change: -0.07, colour: "c", name: "Taxis", population: 110, share: 15 },
  ];

  it("should sort by name ascending", () => {
    expect(sortClasses(ranked, "name", "asc").map((row) => row.name)).toEqual([
      "Buses",
      "Cars",
      "Taxis",
    ]);
  });

  it("should sort a missing change below every real one", () => {
    expect(
      sortClasses(ranked, "change", "desc").map((row) => row.name),
    ).toEqual(["Cars", "Taxis", "Buses"]);
  });

  it("should not mutate the input", () => {
    sortClasses(ranked, "population", "asc");
    expect(ranked[0].name).toBe("Cars");
  });
});
