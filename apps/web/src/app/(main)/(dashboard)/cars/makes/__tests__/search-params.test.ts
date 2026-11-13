import {
  loadSearchParams,
  type MakesSearchParams,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";

const DEFAULTS: MakesSearchParams = {
  fuel: null,
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

  it("should clear the powertrain when it is set to null", () => {
    expect(serialize("/cars/makes", { ...DEFAULTS, fuel: null })).toBe(
      "/cars/makes",
    );
  });
});
