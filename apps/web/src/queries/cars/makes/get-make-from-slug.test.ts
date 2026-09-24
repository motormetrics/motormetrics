import { vi } from "vitest";

const { getDistinctMakesMock, slugifyMock } = vi.hoisted(() => ({
  getDistinctMakesMock: vi.fn(),
  slugifyMock: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, "-")),
}));

vi.mock("@motormetrics/utils/slugify", () => ({
  slugify: slugifyMock,
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("@web/queries/cars/filter-options", () => ({
  getDistinctMakes: getDistinctMakesMock,
}));

import { getMakeFromSlug } from "@web/queries/cars/makes/get-make-from-slug";

const mockMakes = (makes: string[]) =>
  getDistinctMakesMock.mockResolvedValue(makes.map((make) => ({ make })));

describe("getMakeFromSlug", () => {
  beforeEach(() => {
    getDistinctMakesMock.mockReset();
    slugifyMock.mockClear();
  });

  it("should return exact DB make name when slug matches", async () => {
    mockMakes(["MERCEDES BENZ", "BMW", "AUDI"]);

    const result = await getMakeFromSlug("mercedes-benz");

    expect(result).toBe("MERCEDES BENZ");
    expect(slugifyMock).toHaveBeenCalledWith("MERCEDES BENZ");
  });

  it("should return undefined when slug does not match any make", async () => {
    mockMakes(["MERCEDES BENZ", "BMW", "AUDI"]);

    const result = await getMakeFromSlug("non-existent-make");

    expect(result).toBeUndefined();
  });

  it("should return undefined when the database has no makes", async () => {
    mockMakes([]);

    const result = await getMakeFromSlug("toyota");

    expect(result).toBeUndefined();
  });

  it("should handle makes with multiple words", async () => {
    mockMakes(["ROLLS ROYCE", "ASTON MARTIN"]);

    const result = await getMakeFromSlug("rolls-royce");

    expect(result).toBe("ROLLS ROYCE");
  });

  it("should handle makes with numbers in name", async () => {
    mockMakes(["123MOTORS", "BMW", "AUDI"]);

    const result = await getMakeFromSlug("123motors");

    expect(result).toBe("123MOTORS");
  });

  it("should return first match when multiple makes have same slug", async () => {
    mockMakes(["BMW", "BMW USA", "BMW M"]);

    const result = await getMakeFromSlug("bmw");

    expect(result).toBe("BMW");
  });
});
