import {
  detailCaption,
  mixBreakdown,
  monthSeries,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-detail";

describe("detailCaption", () => {
  const row = { count: 3980, make: "BMW", yoyChange: 4.1 };

  it("should give the latest month, then the period and its change", () => {
    expect(
      detailCaption({
        fuel: null,
        latestMonth: "2026-10",
        month: { count: 412, share: 9.8 },
        range: "ytd",
        row,
      }),
    ).toBe(
      "BMW registered 412 cars in October 2026, 9.8% of the market, and 3,980 from January to October 2026, 4.1% more than a year earlier.",
    );
  });

  it("should not repeat the month when the period is that month", () => {
    expect(
      detailCaption({
        fuel: null,
        latestMonth: "2026-10",
        month: { count: 412, share: 9.8 },
        range: "month",
        row: { ...row, count: 412, yoyChange: -12 },
      }),
    ).toBe(
      "BMW registered 412 cars in October 2026, 9.8% of the market, 12.0% fewer than a year earlier.",
    );
  });

  it("should name the powertrain and say when the month had none", () => {
    expect(
      detailCaption({
        fuel: "Electric",
        latestMonth: "2026-10",
        month: undefined,
        range: "12m",
        row: { ...row, count: 40, yoyChange: null },
      }),
    ).toBe(
      "BMW registered no new electric cars in October 2026, and 40 from November 2025 to October 2026.",
    );
  });

  it("should withhold the change when the year-earlier base was under 20", () => {
    expect(
      detailCaption({
        fuel: null,
        latestMonth: "2026-10",
        month: { count: 1, share: 0.02 },
        range: "ytd",
        row: { count: 30, make: "Lotus", yoyChange: 200 },
      }),
    ).toBe(
      "Lotus registered 1 car in October 2026, under 0.1% of the market, and 30 from January to October 2026.",
    );
  });
});

describe("monthSeries", () => {
  const rows = [
    { count: 10, fuelType: "Petrol", month: "2026-10" },
    { count: 5, fuelType: "Electric", month: "2026-10" },
    { count: 7, fuelType: "Petrol", month: "2025-01" },
    // Before the 24-month window.
    { count: 99, fuelType: "Petrol", month: "2024-10" },
  ];

  it("should cover the 24 months to the latest, oldest first, with gaps as zero", () => {
    const series = monthSeries(rows, "2026-10", null);

    expect(series).toHaveLength(24);
    expect(series[0]).toEqual({ count: 0, month: "2024-11" });
    expect(series.at(-1)).toEqual({ count: 15, month: "2026-10" });
    expect(series.find((point) => point.month === "2025-01")?.count).toBe(7);
  });

  it("should keep only the selected powertrain", () => {
    expect(monthSeries(rows, "2026-10", "Electric").at(-1)?.count).toBe(5);
  });
});

describe("mixBreakdown", () => {
  const rows = [
    { count: 60, fuelType: "Electric", month: "2026-10", vehicleType: "SUV" },
    { count: 20, fuelType: "Petrol", month: "2026-09", vehicleType: "Sedan" },
    { count: 10, fuelType: "Petrol", month: "2026-10", vehicleType: "SUV" },
    { count: 6, fuelType: "Diesel", month: "2026-10", vehicleType: "MPV" },
    {
      count: 4,
      fuelType: "Petrol-Electric",
      month: "2026-10",
      vehicleType: "Hatchback",
    },
    // Before the period.
    { count: 99, fuelType: "Petrol", month: "2025-12", vehicleType: "SUV" },
  ];

  it("should give the fuel mix largest first, folding the tail into Other", () => {
    expect(
      mixBreakdown(rows, "2026-10", "ytd", null).fuel.map((part) => part.label),
    ).toEqual(["Electric", "Petrol", "Diesel", "Petrol-Electric"]);

    const { fuel } = mixBreakdown(
      [
        ...rows,
        {
          count: 2,
          fuelType: "Petrol-Electric (Plug-In)",
          month: "2026-10",
          vehicleType: "SUV",
        },
      ],
      "2026-10",
      "ytd",
      null,
    );
    expect(fuel.map((part) => part.label)).toEqual([
      "Electric",
      "Petrol",
      "Diesel",
      "Other",
    ]);
    expect(fuel.at(-1)?.count).toBe(6);
  });

  it("should keep only the period and the selected powertrain", () => {
    const { body } = mixBreakdown(rows, "2026-10", "month", "Petrol");

    expect(body).toEqual([{ count: 10, label: "SUV", share: 100 }]);
  });

  it("should be empty when the make registered nothing in the period", () => {
    expect(mixBreakdown(rows, "2027-06", "month", null)).toEqual({
      body: [],
      fuel: [],
    });
  });
});
