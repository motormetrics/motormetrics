import { sortByDescriptor } from "./sort";

describe("sortByDescriptor", () => {
  const numericData = [
    { name: "A", value: 30 },
    { name: "B", value: 10 },
    { name: "C", value: 20 },
  ];

  const stringData = [
    { name: "Charlie", value: 1 },
    { name: "Alice", value: 2 },
    { name: "Bob", value: 3 },
  ];

  it("should sort numeric values ascending", () => {
    const result = sortByDescriptor(numericData, {
      column: "value",
      direction: "ascending",
    });
    expect(result.map((r) => r.value)).toEqual([10, 20, 30]);
  });

  it("should sort numeric values descending", () => {
    const result = sortByDescriptor(numericData, {
      column: "value",
      direction: "descending",
    });
    expect(result.map((r) => r.value)).toEqual([30, 20, 10]);
  });

  it("should sort string values ascending", () => {
    const result = sortByDescriptor(stringData, {
      column: "name",
      direction: "ascending",
    });
    expect(result.map((r) => r.name)).toEqual(["Alice", "Bob", "Charlie"]);
  });

  it("should sort string values descending", () => {
    const result = sortByDescriptor(stringData, {
      column: "name",
      direction: "descending",
    });
    expect(result.map((r) => r.name)).toEqual(["Charlie", "Bob", "Alice"]);
  });

  it("should handle empty data", () => {
    const result = sortByDescriptor([], {
      column: "value",
      direction: "ascending",
    });
    expect(result).toEqual([]);
  });
});
