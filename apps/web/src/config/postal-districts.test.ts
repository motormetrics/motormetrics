import {
  districtForPostalCode,
  getPostalDistrict,
  POSTAL_DISTRICTS,
} from "./postal-districts";

describe("POSTAL_DISTRICTS", () => {
  it("should cover every sector exactly once", () => {
    const sectors = POSTAL_DISTRICTS.flatMap((district) => district.sectors);

    expect(new Set(sectors).size).toBe(sectors.length);
    expect(POSTAL_DISTRICTS).toHaveLength(28);
  });

  it("should use unique slugs", () => {
    const slugs = POSTAL_DISTRICTS.map((district) => district.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe("districtForPostalCode", () => {
  it("should resolve the leading sector", () => {
    expect(districtForPostalCode("188537")?.slug).toBe("middle-road-bugis");
    expect(districtForPostalCode("520618")?.region).toBe("East");
  });

  it("should return undefined for unassigned or missing codes", () => {
    expect(districtForPostalCode("740000")).toBeUndefined();
    expect(districtForPostalCode(null)).toBeUndefined();
  });
});

describe("getPostalDistrict", () => {
  it("should look up by slug", () => {
    expect(getPostalDistrict("jurong-boon-lay-tuas")?.name).toBe(
      "Jurong / Boon Lay / Tuas",
    );
    expect(getPostalDistrict("nowhere")).toBeUndefined();
  });
});
