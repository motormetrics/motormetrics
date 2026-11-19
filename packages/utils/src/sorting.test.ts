import { describe, expect, it } from "vitest";
import { SortDirection, sortByName, sortByValue } from "./sorting";

describe("SortDirection", () => {
  it("should have ASC and DESC values", () => {
    expect(SortDirection.ASC).toBe("ASC");
    expect(SortDirection.DESC).toBe("DESC");
  });
});

describe("sortByName", () => {
  const testData = [
    { name: "zebra", value: 1 },
    { name: "apple", value: 2 },
    { name: "banana", value: 3 },
  ];

  it("should sort by name in ascending order by default", () => {
    const result = sortByName(testData, { sortKey: "name" });
    expect(result.map((item) => item.name)).toEqual([
      "apple",
      "banana",
      "zebra",
    ]);
  });

  it("should sort by name in ascending order explicitly", () => {
    const result = sortByName(testData, {
      sortKey: "name",
      direction: SortDirection.ASC,
    });
    expect(result.map((item) => item.name)).toEqual([
      "apple",
      "banana",
      "zebra",
    ]);
  });

  it("should sort by name in descending order", () => {
    const result = sortByName(testData, {
      sortKey: "name",
      direction: SortDirection.DESC,
    });
    expect(result.map((item) => item.name)).toEqual([
      "zebra",
      "banana",
      "apple",
    ]);
  });

  it("should handle empty array", () => {
    const result = sortByName([], { sortKey: "name" });
    expect(result).toEqual([]);
  });
});

describe("sortByValue", () => {
  const testData = [
    { name: "item1", value: 30 },
    { name: "item2", value: 10 },
    { name: "item3", value: 20 },
  ];

  it("should sort by value in ascending order by default", () => {
    const result = sortByValue(testData, { sortKey: "value" });
    expect(result.map((item) => item.value)).toEqual([10, 20, 30]);
  });

  it("should sort by value in ascending order explicitly", () => {
    const result = sortByValue(testData, {
      sortKey: "value",
      direction: SortDirection.ASC,
    });
    expect(result.map((item) => item.value)).toEqual([10, 20, 30]);
  });

  it("should sort by value in descending order", () => {
    const result = sortByValue(testData, {
      sortKey: "value",
      direction: SortDirection.DESC,
    });
    expect(result.map((item) => item.value)).toEqual([30, 20, 10]);
  });

  it("should handle empty array", () => {
    const result = sortByValue([], { sortKey: "value" });
    expect(result).toEqual([]);
  });
});
