import type { SelectPost } from "@motormetrics/database/schema";
import { getPqpRates } from "@web/queries/coe/pqp/rates";
import { getPostTrends } from "@web/queries/posts/trends";
import type { Pqp } from "@web/types/coe";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@web/queries/coe/pqp/rates", () => ({ getPqpRates: vi.fn() }));
vi.mock("@web/queries/coe/historical-results", () => ({
  getCoeResults: vi.fn(),
}));
vi.mock("@web/queries/cars/monthly-registrations", () => ({
  getMonthlyRegistrationTotals: vi.fn(),
  getMonthlyRegistrationTotalsByFuelType: vi.fn(),
}));
vi.mock("@web/queries/deregistrations/all", () => ({
  getDeregistrations: vi.fn(),
}));

const post = { dataType: "pqp", id: "post-1", month: "2026-03" } as SelectPost;

const rates = (categoryA: number, categoryB?: number) =>
  ({
    "Category A": categoryA,
    ...(categoryB === undefined ? {} : { "Category B": categoryB }),
  }) as Pqp.Rates;

describe("getPostTrends", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should chart Category A and B on the same months", async () => {
    vi.mocked(getPqpRates).mockResolvedValue({
      "2026-02": rates(100_000, 120_000),
      "2026-03": rates(101_000, 121_000),
    });

    const trends = await getPostTrends([post]);

    expect(trends["post-1"]).toEqual({
      caption: "Category A and B PQP, 2 months to March 2026.",
      second: { labels: ["Cat A", "Cat B"], values: [120_000, 121_000] },
      values: [100_000, 101_000],
    });
  });

  it("should leave out a month that has no Category B figure", async () => {
    vi.mocked(getPqpRates).mockResolvedValue({
      "2026-01": rates(99_000),
      "2026-02": rates(100_000, 120_000),
      "2026-03": rates(101_000, 121_000),
    });

    const trends = await getPostTrends([post]);

    expect(trends["post-1"].values).toEqual([100_000, 101_000]);
    expect(trends["post-1"].second?.values).toEqual([120_000, 121_000]);
  });
});
