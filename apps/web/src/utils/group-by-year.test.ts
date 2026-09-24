import { groupByYear } from "@web/utils/group-by-year";

const mockDates = [
  "2023-01",
  "2023-02",
  "2023-03",
  "2023-04",
  "2023-05",
  "2023-06",
  "2024-01",
  "2024-02",
  "2024-03",
  "2024-04",
  "2024-05",
  "2024-06",
];

const mockGroupedDates = {
  "2023": ["01", "02", "03", "04", "05", "06"],
  "2024": ["01", "02", "03", "04", "05", "06"],
};

describe("groupByYear", () => {
  it("should group an array of dates into its year", () => {
    expect(groupByYear(mockDates)).toStrictEqual(mockGroupedDates);
  });

  it("should return falsy value as-is when dates is falsy", () => {
    expect(groupByYear(undefined as unknown as string[])).toBeUndefined();
    expect(groupByYear(null as unknown as string[])).toBeNull();
  });

  it("should return empty object for empty array", () => {
    expect(groupByYear([])).toStrictEqual({});
  });
});
