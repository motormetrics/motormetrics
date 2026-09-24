import { getDeregistrations } from "@web/queries/deregistrations/all";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getDeregistrations", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return all deregistrations ordered by month ascending", async () => {
    queueSelect([
      { month: "2023-11", category: "Category A", number: 100 },
      { month: "2023-12", category: "Category A", number: 150 },
      { month: "2024-01", category: "Category A", number: 200 },
    ]);

    const result = await getDeregistrations();

    expect(result).toEqual([
      { month: "2023-11", category: "Category A", number: 100 },
      { month: "2023-12", category: "Category A", number: 150 },
      { month: "2024-01", category: "Category A", number: 200 },
    ]);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("deregistrations:months");
  });

  it("should return empty array when no data exists", async () => {
    queueSelect([]);

    const result = await getDeregistrations();

    expect(result).toEqual([]);
  });
});
