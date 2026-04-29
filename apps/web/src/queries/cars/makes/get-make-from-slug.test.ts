import { vi } from "vitest";

const { zrangeMock, getDistinctMakesMock, slugifyMock } = vi.hoisted(() => ({
  zrangeMock: vi.fn(),
  getDistinctMakesMock: vi.fn(),
  slugifyMock: vi.fn((str: string) => str.toLowerCase().replace(/\s+/g, "-")),
}));

vi.mock("@motormetrics/utils", () => ({
  redis: {
    zrange: zrangeMock,
  },
  slugify: slugifyMock,
}));

vi.mock("next/cache", () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

vi.mock("@web/lib/redis/makes", () => ({
  MAKES_SORTED_SET_KEY: "makes:alpha",
}));

vi.mock("@web/queries/cars", () => ({
  getDistinctMakes: getDistinctMakesMock,
}));

import { getMakeFromSlug } from "./get-make-from-slug";

describe("getMakeFromSlug", () => {
  beforeEach(() => {
    zrangeMock.mockReset();
    getDistinctMakesMock.mockReset();
    slugifyMock.mockClear();
  });

  it("should return exact DB make name from Redis data when slug matches", async () => {
    zrangeMock.mockResolvedValue(["MERCEDES BENZ", "BMW", "AUDI"]);

    const result = await getMakeFromSlug("mercedes-benz");

    expect(result).toBe("MERCEDES BENZ");
    expect(slugifyMock).toHaveBeenCalledWith("MERCEDES BENZ");
  });

  it("should return undefined when slug does not match any make", async () => {
    zrangeMock.mockResolvedValue(["MERCEDES BENZ", "BMW", "AUDI"]);

    const result = await getMakeFromSlug("non-existent-make");

    expect(result).toBeUndefined();
  });

  it("should fallback to database when Redis returns empty array", async () => {
    zrangeMock.mockResolvedValue([]);
    getDistinctMakesMock.mockResolvedValue([
      { make: "TOYOTA" },
      { make: "HONDA" },
    ]);

    const result = await getMakeFromSlug("toyota");

    expect(getDistinctMakesMock).toHaveBeenCalled();
    expect(result).toBe("TOYOTA");
  });

  it("should fallback to database when Redis returns null", async () => {
    zrangeMock.mockResolvedValue(null);
    getDistinctMakesMock.mockResolvedValue([{ make: "BMW" }]);

    const result = await getMakeFromSlug("bmw");

    expect(getDistinctMakesMock).toHaveBeenCalled();
    expect(result).toBe("BMW");
  });

  it("should return undefined when both Redis and database have no matching data", async () => {
    zrangeMock.mockResolvedValue([]);
    getDistinctMakesMock.mockResolvedValue([]);

    const result = await getMakeFromSlug("toyota");

    expect(result).toBeUndefined();
  });

  it("should handle makes with multiple words", async () => {
    zrangeMock.mockResolvedValue(["ROLLS ROYCE", "ASTON MARTIN"]);

    const result = await getMakeFromSlug("rolls-royce");

    expect(result).toBe("ROLLS ROYCE");
  });

  it("should handle makes with numbers in name", async () => {
    zrangeMock.mockResolvedValue(["123MOTORS", "BMW", "AUDI"]);

    const result = await getMakeFromSlug("123motors");

    expect(result).toBe("123MOTORS");
  });

  it("should return first match when multiple makes have same slug", async () => {
    zrangeMock.mockResolvedValue(["BMW", "BMW USA", "BMW M"]);

    const result = await getMakeFromSlug("bmw");

    expect(result).toBe("BMW");
  });
});
