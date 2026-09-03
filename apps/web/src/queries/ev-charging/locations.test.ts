import { connector } from "./fixtures";
import { groupLocations, inDistrict } from "./locations";

describe("groupLocations", () => {
  it("should roll connectors up per location with counts, top speed and lowest price", () => {
    const locations = groupLocations([
      connector({ evCpId: "A" }),
      connector({
        evCpId: "B",
        powerRating: "DC",
        chargingSpeedKw: 120,
        price: 0.65,
      }),
      connector({ evCpId: "C", price: 2, priceType: "$/h" }),
      connector({ evCpId: "D", locationId: "L2", stationName: "Other" }),
    ]);

    expect(locations).toEqual([
      expect.objectContaining({
        locationId: "L1",
        connectors: 3,
        dcConnectors: 1,
        maxSpeedKw: 120,
        minPricePerKwh: 0.65,
      }),
      expect.objectContaining({ locationId: "L2", connectors: 1 }),
    ]);
  });
});

describe("inDistrict", () => {
  it("should match the postal sector and treat unknown slugs as all Singapore", () => {
    expect(inDistrict("188537", "middle-road-bugis")).toBe(true);
    expect(inDistrict("520618", "middle-road-bugis")).toBe(false);
    expect(inDistrict(null, "middle-road-bugis")).toBe(false);
    expect(inDistrict("520618", undefined)).toBe(true);
    expect(inDistrict("520618", "nowhere")).toBe(true);
  });
});
