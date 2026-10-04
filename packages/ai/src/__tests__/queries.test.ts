import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getCarsAggregatedByMonth,
  getCoeForMonth,
  getCoePremiumsForPqpWindow,
  getDeregistrationsForMonth,
  getEvDataForMonth,
  getLatestCompleteMonth,
  getMonthlyComputedFigures,
  getPqpForMonth,
  getPriorMonthsCarsSummary,
  getPriorMonthsCoeSummary,
  getPriorMonthsDeregistrationsSummary,
  getPriorMonthsPqpSummary,
  getTotalRegistrationsForMonth,
} from "../queries";

// Use Drizzle's real query builder and row mapping. Only SQL execution is
// mocked, so filters, grouping and parameterisation remain observable.
const { execute, findMany, database } = await vi.hoisted(async () => {
  const { drizzle } = await import("drizzle-orm/pg-proxy");
  const execute =
    vi.fn<
      (
        query: string,
        params: unknown[],
        method: string,
      ) => Promise<{ rows: unknown[][] }>
    >();
  const findMany = vi.fn();
  return {
    execute,
    findMany,
    database: Object.assign(drizzle(execute), { query: { coe: { findMany } } }),
  };
});
vi.mock("@motormetrics/database/client", () => ({ db: database }));

const month = "2026-07";
const carClasses = ["Category A", "Category B"];

beforeEach(() => {
  vi.resetAllMocks();
  execute.mockResolvedValue({ rows: [] });
});

describe("monthly dataset queries", () => {
  it.each([
    getCarsAggregatedByMonth,
    getEvDataForMonth,
  ])("aggregates positive registrations for the requested month", async (query) => {
    execute.mockResolvedValue({
      rows: [[month, "Toyota", "Electric", "SUV", 60]],
    });
    await expect(query(month)).resolves.toEqual([
      {
        month,
        make: "Toyota",
        fuelType: "Electric",
        vehicleType: "SUV",
        number: 60,
      },
    ]);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toContain('"cars"."number" >');
    expect(sql).toContain(
      'group by "cars"."month", "cars"."make", "cars"."fuel_type", "cars"."vehicle_type"',
    );
    expect(sql).toContain('order by "cars"."make" asc');
    expect(params).toContain(month);
    expect(params).toContain(0);
    if (query === getEvDataForMonth) {
      expect(sql).toContain('"cars"."fuel_type" ilike');
      expect(params).toContain("%electric%");
    } else {
      expect(params).not.toContain("%electric%");
    }
  });

  it("fetches both car COE categories in exercise order", async () => {
    const rows = [
      { month, vehicleClass: "Category A", biddingNo: 1, premium: 100000 },
    ];
    findMany.mockResolvedValue(rows);
    await expect(getCoeForMonth(month)).resolves.toEqual(rows);
    expect(findMany).toHaveBeenCalledExactlyOnceWith({
      columns: { id: false },
      where: { month, vehicleClass: { in: carClasses } },
      orderBy: { biddingNo: "asc", vehicleClass: "asc" },
    });
  });

  it("aggregates deregistrations by category", async () => {
    execute.mockResolvedValue({ rows: [[month, "Category A", 40]] });
    await expect(getDeregistrationsForMonth(month)).resolves.toEqual([
      { month, category: "Category A", number: 40 },
    ]);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toContain(
      'group by "deregistrations"."month", "deregistrations"."category"',
    );
    expect(sql).toContain('order by "deregistrations"."category" asc');
    expect(params).toEqual([month]);
  });

  it.each([
    { rows: [[100]], total: 100 },
    { rows: [], total: 0 },
  ])("returns total registrations with an empty-data fallback", async ({
    rows,
    total,
  }) => {
    execute.mockResolvedValue({ rows });
    await expect(getTotalRegistrationsForMonth(month)).resolves.toBe(total);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toContain('coalesce(sum("number"), 0)');
    expect(sql).not.toContain("fuel_type");
    expect(params).toEqual([month, 0]);
  });

  it("restricts PQP to the two car categories", async () => {
    execute.mockResolvedValue({ rows: [[month, "Category B", 120000]] });
    await expect(getPqpForMonth(month)).resolves.toEqual([
      { month, vehicleClass: "Category B", pqp: 120000 },
    ]);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toContain('"pqp"."vehicle_class" in');
    expect(params).toEqual([month, ...carClasses]);
  });
});

describe("prior month queries", () => {
  it("returns car history oldest first with the default three-month limit", async () => {
    execute.mockResolvedValue({
      rows: [
        ["2026-06", 100, 60, 60],
        ["2026-05", 80, 40, 50],
      ],
    });
    await expect(getPriorMonthsCarsSummary(month)).resolves.toEqual([
      { month: "2026-05", total: 80, bev: 40, bevShare: 50 },
      { month: "2026-06", total: 100, bev: 60, bevShare: 60 },
    ]);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toContain('"cars"."month" <');
    expect(sql).toContain("= 'Electric'");
    expect(sql).toContain('order by "cars"."month" desc');
    expect(params).toEqual([month, 0, 3]);
  });

  it("returns deregistration history oldest first with a custom limit", async () => {
    execute.mockResolvedValue({
      rows: [
        ["2026-06", 90],
        ["2026-05", 70],
      ],
    });
    await expect(
      getPriorMonthsDeregistrationsSummary(month, 2),
    ).resolves.toEqual([
      { month: "2026-05", total: 70 },
      { month: "2026-06", total: 90 },
    ]);
    expect(execute.mock.calls[0][1]).toEqual([month, 2]);
  });

  it("limits PQP history by months times the two reported categories", async () => {
    execute.mockResolvedValue({
      rows: [
        ["2026-06", "Category A", 90000],
        ["2026-05", "Category A", 80000],
      ],
    });
    const result = await getPriorMonthsPqpSummary(month, 2);
    expect(result.map((row) => row.month)).toEqual(["2026-05", "2026-06"]);
    expect(execute.mock.calls[0][1]).toEqual([month, ...carClasses, 4]);
  });

  it.each([
    [getPriorMonthsCoeSummary, 3],
    [getCoePremiumsForPqpWindow, 4],
  ] as const)("limits COE history by months before fetching all their exercises", async (query, defaultLimit) => {
    execute
      .mockResolvedValueOnce({ rows: [["2026-06"], ["2026-05"]] })
      .mockResolvedValueOnce({ rows: [] });
    await expect(query(month)).resolves.toEqual([]);
    expect(execute.mock.calls[0][0]).toContain("select distinct");
    expect(execute.mock.calls[0][1]).toEqual([month, defaultLimit]);
    const [sql, params] = execute.mock.calls[1];
    expect(params).toEqual(["2026-06", "2026-05", ...carClasses]);
    expect(sql).toContain(
      'order by "coe"."month" asc, "coe"."bidding_no" asc, "coe"."vehicle_class" asc',
    );
  });

  it.each([
    getPriorMonthsCoeSummary,
    getCoePremiumsForPqpWindow,
  ])("skips the second query when no prior months exist", async (query) => {
    await expect(query(month, 2)).resolves.toEqual([]);
    expect(execute).toHaveBeenCalledTimes(1);
    expect(execute.mock.calls[0][1]).toEqual([month, 2]);
  });
});

describe("getLatestCompleteMonth", () => {
  it.each([
    { rows: [[month]], expected: month },
    { rows: [], expected: null },
  ])("requires all datasets and both COE exercises", async ({
    rows,
    expected,
  }) => {
    execute.mockResolvedValue({ rows });
    await expect(getLatestCompleteMonth()).resolves.toBe(expected);
    const [sql, params] = execute.mock.calls[0];
    expect(sql).toContain('exists (select 1 from "deregistrations"');
    expect(sql).toContain('exists (select 1 from "pqp"');
    expect(sql).toContain("count(distinct c.bidding_no)");
    expect(sql).toContain(">= 2");
    expect(sql).toContain('order by "cars"."month" desc limit');
    expect(params).toEqual([0, 1]);
  });
});

describe("getMonthlyComputedFigures", () => {
  it("returns zero totals and empty comparisons when datasets are empty", async () => {
    const result = await getMonthlyComputedFigures(month);
    expect(result).toMatchObject({
      month,
      totalRegistrationsAllFuelTypes: 0,
      bevRegistrations: 0,
      bevSharePctOfTotalRegistrations: 0,
      hybridRegistrations: 0,
      hybridSharePctOfTotalRegistrations: 0,
      petrolRegistrations: 0,
      petrolSharePctOfTotalRegistrations: 0,
      dieselRegistrations: undefined,
      dieselSharePctOfTotalRegistrations: undefined,
      deregistrationsTotalAllCategories: 0,
      netFleetChangeTotalRegistrationsMinusTotalDeregistrations: 0,
      pqpByCategory: [],
      priorMonths: [],
    });
  });

  it.each([
    0, 5,
  ])("combines SQL figures and comparisons when diesel registrations are %s", async (diesel) => {
    execute.mockImplementation(async (sql) => {
      if (sql.includes('from "cars"')) {
        if (sql.includes('group by "cars"."month"')) {
          return {
            rows: sql.includes('"cars"."month" <')
              ? [
                  ["2026-06", 90, 40, 44, 20, 22, 30, 33],
                  ["2026-05", 80, 30, 38, 20, 25, 30, 38],
                ]
              : [
                  [
                    month,
                    100,
                    60,
                    60,
                    20,
                    20,
                    20 - diesel,
                    20 - diesel,
                    diesel,
                    diesel,
                  ],
                ],
          };
        }
        if (sql.includes('group by "cars"."fuel_type"'))
          return { rows: [["Electric", 60, 60]] };
        if (sql.includes('group by "cars"."vehicle_type"'))
          return { rows: [["SUV", 100, 100]] };
        return {
          rows: sql.includes('"cars"."fuel_type" =')
            ? [[1, "BYD", 50, 83]]
            : [[1, "BYD", 55, 55]],
        };
      }
      if (sql.includes('from "deregistrations"')) {
        return {
          rows: sql.includes('group by "deregistrations"."month"')
            ? [["2026-06", 95]]
            : [
                ["Category A", 70, 70],
                ["Category B", 30, 30],
              ],
        };
      }
      if (sql.includes('from "coe"'))
        return {
          rows: [["Category A", 100, 200, 100000, 110, 220, 110000, 10000]],
        };
      if (sql.includes('from "pqp"'))
        return {
          rows: [
            ["Category A", 105000, 95000, 10000],
            ["Category B", 120000, 115000, 5000],
          ],
        };
      throw new Error(`Unexpected query: ${sql}`);
    });

    const result = await getMonthlyComputedFigures(month, 2);
    expect(result).toMatchObject({
      totalRegistrationsAllFuelTypes: 100,
      bevRegistrations: 60,
      bevSharePctOfTotalRegistrations: 60,
      hybridRegistrations: 20,
      hybridSharePctOfTotalRegistrations: 20,
      dieselRegistrations: diesel || undefined,
      dieselSharePctOfTotalRegistrations: diesel || undefined,
      deregistrationsTotalAllCategories: 100,
      netFleetChangeTotalRegistrationsMinusTotalDeregistrations: 0,
      topMakesOverallAllFuelTypes: [
        {
          rank: 1,
          make: "BYD",
          registrationsAllFuelTypes: 55,
          sharePctOfTotalRegistrations: 55,
        },
      ],
      topBevMakesElectricOnly: [
        {
          rank: 1,
          make: "BYD",
          bevRegistrations: 50,
          sharePctOfBevRegistrations: 83,
        },
      ],
      pqpByCategory: [
        {
          vehicleClass: "Category A",
          pqpMinusPremiumExercise1: 5000,
          pqpMinusPremiumExercise2: -5000,
        },
        {
          vehicleClass: "Category B",
          pqpMinusPremiumExercise1: undefined,
          pqpMinusPremiumExercise2: undefined,
        },
      ],
      priorMonths: [
        {
          month: "2026-05",
          deregistrationsTotalAllCategories: 0,
          netFleetChangeTotalRegistrationsMinusTotalDeregistrations: 80,
        },
        {
          month: "2026-06",
          deregistrationsTotalAllCategories: 95,
          netFleetChangeTotalRegistrationsMinusTotalDeregistrations: -5,
        },
      ],
    });
    expect(result.hybridFuelTypesCounted).toBe(
      "Petrol-Electric + Petrol-Electric (Plug-In) + Diesel-Electric",
    );
    const bevQuery = execute.mock.calls.find(
      ([sql]) =>
        sql.includes('group by "cars"."make"') &&
        sql.includes('"cars"."fuel_type" ='),
    );
    expect(bevQuery?.[1]).toEqual([month, "Electric", 0, 10]);
    const totalsQuery = execute.mock.calls.find(
      ([sql]) =>
        sql.includes("filter (where") && sql.includes('"cars"."month" ='),
    );
    expect(totalsQuery?.[0]).toContain('nullif(sum("number"), 0)');
    expect(totalsQuery?.[1]).toEqual([
      "Electric",
      "Electric",
      "Petrol-Electric",
      "Petrol-Electric (Plug-In)",
      "Diesel-Electric",
      "Petrol-Electric",
      "Petrol-Electric (Plug-In)",
      "Diesel-Electric",
      "Petrol",
      "Petrol",
      "Diesel",
      "Diesel",
      month,
      0,
    ]);
  });

  it("omits comparisons for a missing exercise but preserves a zero premium", async () => {
    execute.mockImplementation(async (sql) => {
      if (sql.includes('from "coe"'))
        return { rows: [["Category A", 100, 200, null, 100, 200, 0, null]] };
      if (sql.includes('from "pqp"'))
        return { rows: [["Category A", 100000, 90000, 10000]] };
      return { rows: [] };
    });
    const result = await getMonthlyComputedFigures(month);
    expect(result.pqpByCategory[0]).toMatchObject({
      pqpMinusPremiumExercise1: undefined,
      pqpMinusPremiumExercise2: 100000,
    });
  });

  it("propagates SQL execution failures instead of reporting empty data", async () => {
    execute.mockRejectedValue(new Error("Database unavailable"));
    await expect(getMonthlyComputedFigures(month)).rejects.toThrow();
  });
});
