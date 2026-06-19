import { describe, expect, it } from "vitest";
import { tokeniser } from "../tokeniser";

describe("tokeniser", () => {
  it("should return empty string for empty array", () => {
    const result = tokeniser([]);
    expect(result).toBe("");
  });

  it("should convert simple object array to pipe-delimited format", () => {
    const data = [
      { name: "John", age: 30, city: "Singapore" },
      { name: "Jane", age: 25, city: "Malaysia" },
    ];

    const result = tokeniser(data);
    const expected = "name|age|city\nJohn|30|Singapore\nJane|25|Malaysia";
    expect(result).toBe(expected);
  });

  it("should handle null and undefined values", () => {
    const data = [
      { name: "John", age: null, city: undefined },
      { name: "Jane", age: 25, city: "Malaysia" },
    ];

    const result = tokeniser(data);
    const expected = "name|age|city\nJohn||\nJane|25|Malaysia";
    expect(result).toBe(expected);
  });

  it("should handle mixed data types", () => {
    const data = [
      { id: 1, name: "Test", active: true, score: 95.5 },
      { id: 2, name: "Demo", active: false, score: 88.2 },
    ];

    const result = tokeniser(data);
    const expected =
      "id|name|active|score\n1|Test|true|95.5\n2|Demo|false|88.2";
    expect(result).toBe(expected);
  });

  it("should handle single object", () => {
    const data = [{ make: "Toyota", model: "Camry", year: 2023 }];

    const result = tokeniser(data);
    const expected = "make|model|year\nToyota|Camry|2023";
    expect(result).toBe(expected);
  });

  it("should handle objects with different properties", () => {
    const data = [
      { name: "John", age: 30 },
      { name: "Jane", city: "Singapore" },
    ];

    const result = tokeniser(data);
    const expected = "name|age\nJohn|30\nJane|";
    expect(result).toBe(expected);
  });

  it("should handle empty strings as values", () => {
    const data = [
      { name: "", description: "Test", category: "" },
      { name: "Item", description: "", category: "Electronics" },
    ];

    const result = tokeniser(data);
    const expected = "name|description|category\n|Test|\nItem||Electronics";
    expect(result).toBe(expected);
  });

  it("should handle zero values correctly", () => {
    const data = [
      { count: 0, price: 0.0, available: false },
      { count: 5, price: 10.99, available: true },
    ];

    const result = tokeniser(data);
    const expected = "count|price|available\n0|0|false\n5|10.99|true";
    expect(result).toBe(expected);
  });
});
