vi.mock("./snapshot", () => ({ getEvChargingSnapshot: vi.fn() }));

import { connector } from "./fixtures";
import { getEvChargingPriceRankings } from "./price-rankings";
import { getEvChargingSnapshot } from "./snapshot";

const records = [
  connector({ evCpId: "A", locationId: "L1", stationName: "Beta", price: 0.7 }),
  connector({ evCpId: "B", locationId: "L1", price: 0.65 }),
  connector({
    evCpId: "C",
    locationId: "L2",
    stationName: "Alpha",
    price: 0.7,
  }),
  connector({
    evCpId: "D",
    locationId: "L3",
    stationName: "Fast",
    powerRating: "DC",
    chargingSpeedKw: 120,
    price: 0.5,
  }),
  connector({
    evCpId: "E",
    locationId: "L3",
    powerRating: "DC",
    chargingSpeedKw: 50,
    price: 0.55,
  }),
  connector({
    evCpId: "F",
    locationId: "L4",
    stationName: "Hourly",
    price: 3,
    priceType: "$/h",
  }),
  connector({
    evCpId: "G",
    locationId: "L5",
    stationName: "East",
    postalCode: "520618",
    price: 0.9,
  }),
  connector({ evCpId: "H", locationId: "L6", price: null }),
];

describe("getEvChargingPriceRankings", () => {
  beforeEach(() => {
    vi.mocked(getEvChargingSnapshot).mockResolvedValue({
      observedAt: null,
      records,
    });
  });

  it("should rank AC locations cheapest first by their lowest price, ties by name", async () => {
    const rows = await getEvChargingPriceRankings({
      powerRating: "AC",
      order: "cheapest",
    });

    expect(rows.map((row) => [row.locationId, row.pricePerKwh])).toEqual([
      ["L1", 0.65],
      ["L2", 0.7],
      ["L5", 0.9],
    ]);
    expect(rows[0]).toMatchObject({ connectors: 2, speedKw: 7.4 });
  });

  it("should rank priciest first using each location's highest price", async () => {
    const rows = await getEvChargingPriceRankings({
      powerRating: "AC",
      order: "priciest",
      limit: 2,
    });

    expect(rows.map((row) => [row.locationId, row.pricePerKwh])).toEqual([
      ["L5", 0.9],
      ["L2", 0.7],
    ]);
  });

  it("should only count connectors of the requested rating", async () => {
    const rows = await getEvChargingPriceRankings({
      powerRating: "DC",
      order: "cheapest",
    });

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      locationId: "L3",
      pricePerKwh: 0.5,
      speedKw: 120,
      connectors: 2,
    });
  });

  it("should filter by district", async () => {
    const rows = await getEvChargingPriceRankings({
      powerRating: "AC",
      order: "cheapest",
      district: "tampines-pasir-ris",
    });

    expect(rows.map((row) => row.locationId)).toEqual(["L5"]);
  });

  it("should tolerate connectors without a speed", async () => {
    vi.mocked(getEvChargingSnapshot).mockResolvedValueOnce({
      observedAt: null,
      records: [connector({ evCpId: "A", chargingSpeedKw: null })],
    });

    const [row] = await getEvChargingPriceRankings({
      powerRating: "AC",
      order: "cheapest",
    });

    expect(row.speedKw).toBeNull();
  });
});
