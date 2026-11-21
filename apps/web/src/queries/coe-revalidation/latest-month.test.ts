import { getCoeRevalidationLatestMonth } from "@web/queries/coe-revalidation/latest-month";
import {
  cacheLifeMock,
  cacheTagMock,
  queueSelect,
  resetDbMocks,
} from "@web/queries/test-utils";
import { describe, expect, it } from "vitest";

describe("getCoeRevalidationLatestMonth", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return the latest month", async () => {
    queueSelect([{ month: "2026-09" }]);

    const result = await getCoeRevalidationLatestMonth();

    expect(result).toEqual({ month: "2026-09" });
    expect(cacheLifeMock).toHaveBeenCalledWith("max");
    expect(cacheTagMock).toHaveBeenCalledWith("coe-revalidation:months");
  });

  it("should return null month when no data exists", async () => {
    queueSelect([{ month: null }]);

    const result = await getCoeRevalidationLatestMonth();

    expect(result).toEqual({ month: null });
  });
});
