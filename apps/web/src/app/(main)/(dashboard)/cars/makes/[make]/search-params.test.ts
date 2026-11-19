import {
  loadSearchParams,
  type MakeSearchParams,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";

const DEFAULTS: MakeSearchParams = {
  fuelType: null,
  month: null,
  range: "ytd",
};

describe("loadSearchParams", () => {
  it("should fall back to the year to date for an unknown range", () => {
    expect(loadSearchParams("?range=forever").range).toBe("ytd");
  });
});

describe("serialize", () => {
  it("should drop defaults so the default view is the plain make URL", () => {
    expect(serialize("/cars/makes/bmw", DEFAULTS)).toBe("/cars/makes/bmw");
  });

  it("should keep the selected month when the period changes", () => {
    expect(
      serialize("/cars/makes/bmw", {
        ...DEFAULTS,
        month: "2026-08",
        range: "12m",
      }),
    ).toBe("/cars/makes/bmw?month=2026-08&range=12m");
  });

  it("should encode a fuel type as LTA records it", () => {
    expect(
      serialize("/cars/makes/bmw", {
        ...DEFAULTS,
        fuelType: "Petrol-Electric (Plug-In)",
      }),
    ).toBe("/cars/makes/bmw?fuelType=Petrol-Electric+(Plug-In)");
  });
});
