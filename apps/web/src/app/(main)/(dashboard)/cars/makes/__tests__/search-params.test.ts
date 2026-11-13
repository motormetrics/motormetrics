import {
  loadSearchParams,
  type MakesSearchParams,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";

const DEFAULTS: MakesSearchParams = {
  dir: "desc",
  fuel: null,
  range: "ytd",
  sort: "count",
};

describe("loadSearchParams", () => {
  it("should read a fuel type it knows", () => {
    expect(loadSearchParams("?fuel=Electric").fuel).toBe("Electric");
  });

  it("should read an unknown fuel type as no filter", () => {
    expect(loadSearchParams("?fuel=Diesel").fuel).toBeNull();
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
        dir: "asc",
        fuel: "Electric",
        range: "12m",
        sort: "make",
      }),
    ).toBe("/cars/makes?fuel=Electric&range=12m&sort=make&dir=asc");
  });

  it("should clear the fuel filter when it is set to null", () => {
    expect(serialize("/cars/makes", { ...DEFAULTS, fuel: null })).toBe(
      "/cars/makes",
    );
  });
});
