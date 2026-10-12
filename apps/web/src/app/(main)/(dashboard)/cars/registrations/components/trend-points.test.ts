import { trendPoints } from "@web/app/(main)/(dashboard)/cars/registrations/components/trend-points";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";

const seriesOf = (start: string, length: number) =>
  Array.from({ length }, (_, index) => ({
    month: shiftMonth(start, index),
    total: 100 + index,
  }));

describe("trendPoints", () => {
  it("should put the selected month in the darker series only", () => {
    const points = trendPoints(seriesOf("2025-09", 12), "2026-01");

    expect(points[4]).toMatchObject({ other: 0, selected: 104, total: 104 });
    expect(points[3]).toMatchObject({ other: 103, selected: 0 });
  });

  it("should label every month for a year, with the year on the first and January", () => {
    const points = trendPoints(seriesOf("2025-09", 12), "2026-08");

    expect(points.map((point) => point.label)).toEqual([
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
    ]);
    expect(
      points.filter((point) => point.year).map((point) => point.year),
    ).toEqual(["2025", "2026"]);
    expect(points[0].title).toBe("Sep 2025");
  });

  it("should mark only the first month and Januaries for three years", () => {
    const points = trendPoints(seriesOf("2023-09", 36), "2026-08");
    const marked = points.filter((point) => point.label);

    expect(marked.map((point) => `${point.label} ${point.year}`)).toEqual([
      "Sep 2023",
      "Jan 2024",
      "Jan 2025",
      "Jan 2026",
    ]);
  });

  it("should keep only January year marks for longer ranges", () => {
    const points = trendPoints(seriesOf("2016-01", 48), "2019-12");

    expect(points.every((point) => point.label === "")).toBe(true);
    expect(
      points.filter((point) => point.year).map((point) => point.year),
    ).toEqual(["2016", "2017", "2018", "2019"]);
  });
});
