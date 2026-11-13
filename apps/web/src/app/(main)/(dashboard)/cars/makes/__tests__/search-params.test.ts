import {
  loadSearchParams,
  type MakesSearchParams,
  serialize,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";

const DEFAULTS: MakesSearchParams = {
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
});

describe("serialize", () => {
  it("should drop defaults so the default view is the plain path", () => {
    expect(serialize("/cars/makes", DEFAULTS)).toBe("/cars/makes");
  });

  it("should change one param and keep the others", () => {
    expect(
      serialize("/cars/makes", {
        ...DEFAULTS,
        q: "audi",
        range: "12m",
        sort: "make",
      }),
    ).toBe("/cars/makes?range=12m&sort=make&q=audi");
  });
});
