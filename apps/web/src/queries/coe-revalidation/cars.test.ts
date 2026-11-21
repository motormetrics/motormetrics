import { getCarCoeRevalidations } from "@web/queries/coe-revalidation/cars";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getCarCoeRevalidations", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return the Category A and B rows", async () => {
    const rows = [
      {
        month: "2026-09",
        type: "10 Year",
        category: "Category A",
        number: 272,
      },
      { month: "2026-09", type: "5 Year", category: "Category A", number: 593 },
      {
        month: "2026-09",
        type: "10 Year",
        category: "Category B",
        number: 627,
      },
      { month: "2026-09", type: "5 Year", category: "Category B", number: 762 },
    ];
    queueSelect(rows);

    const result = await getCarCoeRevalidations();

    expect(result).toEqual(rows);
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("coe-revalidation:months");
  });
});
