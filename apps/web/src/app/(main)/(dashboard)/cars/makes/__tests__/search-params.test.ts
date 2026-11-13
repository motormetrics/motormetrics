import {
  type MakesSearchParams,
  makesHref,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";

const DEFAULTS: MakesSearchParams = {
  dir: "desc",
  fuel: null,
  range: "ytd",
  sort: "count",
};

describe("makesHref", () => {
  it("should drop defaults so the default view is the plain path", () => {
    expect(makesHref(DEFAULTS, {})).toBe("/cars/makes");
  });

  it("should change one param and keep the others", () => {
    expect(
      makesHref(
        { ...DEFAULTS, fuel: "Electric", sort: "make", dir: "asc" },
        { range: "12m" },
      ),
    ).toBe("/cars/makes?fuel=Electric&range=12m&sort=make&dir=asc");
  });

  it("should clear the fuel filter when it is set to null", () => {
    expect(makesHref({ ...DEFAULTS, fuel: "Petrol" }, { fuel: null })).toBe(
      "/cars/makes",
    );
  });
});
