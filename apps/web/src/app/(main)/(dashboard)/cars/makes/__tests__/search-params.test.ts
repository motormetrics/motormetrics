import { serialize as serializeCompare } from "@web/app/(main)/(dashboard)/cars/makes/compare/search-params";
import {
  loadSearchParams,
  type MakesSearchParams,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";

const DEFAULTS: MakesSearchParams = {
  compare: false,
  fuel: null,
  make: null,
  q: "",
  range: "ytd",
  sort: "count",
};

describe("loadSearchParams", () => {
  it("should read a sort it knows", () => {
    expect(loadSearchParams("?sort=make").sort).toBe("make");
  });

  it("should fall back to the default for an unknown sort", () => {
    expect(loadSearchParams("?sort=yoyChange").sort).toBe("count");
  });

  it("should read a powertrain it knows and drop one it does not", () => {
    expect(loadSearchParams("?fuel=Petrol-Electric").fuel).toBe(
      "Petrol-Electric",
    );
    expect(loadSearchParams("?fuel=Hybrid").fuel).toBeNull();
    expect(loadSearchParams("?fuel=Diesel").fuel).toBeNull();
  });

  it("should read the selected make, or none", () => {
    expect(loadSearchParams("?make=bmw").make).toBe("bmw");
    expect(loadSearchParams("").make).toBeNull();
  });

  it("should read whether a comparison is being picked", () => {
    expect(loadSearchParams("?make=bmw&compare=true").compare).toBe(true);
    expect(loadSearchParams("?make=bmw").compare).toBe(false);
  });
});

describe("compare serialize", () => {
  it("should repeat the make key for the two makes", () => {
    expect(
      serializeCompare("/cars/makes/compare", { make: ["bmw", "audi"] }),
    ).toBe("/cars/makes/compare?make=bmw&make=audi");
  });
});

describe("serialize", () => {
  it("should drop defaults so the default view is the plain path", () => {
    expect(serialize("/cars/makes", DEFAULTS)).toBe("/cars/makes");
  });

  it("should change one param and keep the others", () => {
    expect(
      serialize("/cars/makes", {
        ...DEFAULTS,
        fuel: "Electric",
        q: "audi",
        range: "12m",
        sort: "make",
      }),
    ).toBe("/cars/makes?fuel=Electric&range=12m&sort=make&q=audi");
  });

  it("should drop the comparison flag once it is cleared", () => {
    expect(
      serialize("/cars/makes?make=bmw&compare=true", { compare: null }),
    ).toBe("/cars/makes?make=bmw");
  });

  it("should put the selected make first and keep the period", () => {
    expect(
      serialize("/cars/makes", { ...DEFAULTS, make: "bmw", range: "12m" }),
    ).toBe("/cars/makes?make=bmw&range=12m");
  });

  it("should clear the powertrain when it is set to null", () => {
    expect(serialize("/cars/makes", { ...DEFAULTS, fuel: null })).toBe(
      "/cars/makes",
    );
  });
});
