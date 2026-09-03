import {
  deriveLocationId,
  extractLastUpdated,
  extractPostalCode,
  extractStations,
  parseBatch,
  toConnectorStatus,
  toPriceType,
} from "./parse-batch";

const station = {
  address: "15 Queen St Singapore 188537",
  name: "Tan Chong Tower",
  longtitude: "103.851234",
  latitude: 1.298765,
  locationId: "103851234188537",
  chargingPoints: [
    {
      id: "R123456A",
      name: "Tan Chong Tower",
      operator: "EVCO A",
      operationHours: "24 hours",
      position: "B1 Lot 12",
      plugTypes: [
        {
          plugType: "CCS2",
          powerRating: "DC",
          chargingSpeed: "40",
          price: "0.42",
          priceType: "$/kWh",
          evIds: [
            { evCpId: "R123456A-001", status: 1 },
            { evCpId: "R123456A-002", status: "0" },
            { evCpId: "R123456A-003", status: "" },
          ],
        },
      ],
    },
  ],
};

describe("parseBatch", () => {
  it("flattens the nested feed to one record per connector", () => {
    const records = parseBatch({ value: [station] });

    expect(records).toHaveLength(3);
    expect(records[0]).toEqual({
      evCpId: "R123456A-001",
      locationId: "103851234188537",
      chargerId: "R123456A",
      stationName: "Tan Chong Tower",
      address: "15 Queen St Singapore 188537",
      postalCode: "188537",
      longitude: 103.851234,
      latitude: 1.298765,
      operator: "EVCO A",
      operationHours: "24 hours",
      position: "B1 Lot 12",
      plugType: "CCS2",
      powerRating: "DC",
      chargingSpeedKw: 40,
      price: 0.42,
      priceType: "$/kWh",
      status: "available",
    });
    expect(records.map((record) => record.status)).toEqual([
      "available",
      "occupied",
      "unavailable",
    ]);
  });

  it("accepts a bare array and the correct longitude spelling", () => {
    const [record] = parseBatch([
      { ...station, longtitude: undefined, longitude: "103.9" },
    ]);

    expect(record.longitude).toBe(103.9);
  });

  it("falls back to the postal code when locationId is missing", () => {
    const [record] = parseBatch([{ ...station, locationId: undefined }]);

    expect(record.locationId).toBe("188537");
  });

  it("drops connectors without an id", () => {
    const records = parseBatch([
      {
        ...station,
        chargingPoints: [
          {
            plugTypes: [{ evIds: [{ status: 1 }, { id: "X-1", status: 1 }] }],
          },
        ],
      },
    ]);

    expect(records.map((record) => record.evCpId)).toEqual(["X-1"]);
  });
});

describe("parseBatch with the batch file shape", () => {
  const batch = {
    LastUpdatedTime: "2026-09-03 20:55:00",
    evLocationsData: [
      {
        address: "3E RIVER VALLEY ROAD SINGAPORE 179024",
        name: "CLARKE QUAY",
        longtitude: 103.846728,
        latitude: 1.290314,
        postalCode: "179024",
        chargingPoints: [
          {
            status: "1",
            operatingHours: "24 hrs",
            operator: "SP MOBILITY PTE. LTD.",
            position: "L4 51 & 52",
            name: "CLARKE QUAY",
            plugTypes: [
              {
                plugType: "Combo 2",
                price: "0.8938",
                current: "DC",
                powerRating: "50",
                priceType: "kWh",
                evIds: [{ evCpId: "R114858R-002", status: "1" }],
              },
              {
                plugType: "Type 2",
                price: "",
                current: "AC",
                powerRating: "7.4",
                priceType: "",
                evIds: [{ evCpId: "R114858R-003", status: "" }],
              },
            ],
          },
        ],
      },
    ],
  };

  it("reads stations from evLocationsData and derives the location id", () => {
    const records = parseBatch(batch);

    expect(records).toHaveLength(2);
    expect(records[0]).toMatchObject({
      evCpId: "R114858R-002",
      locationId: "846728179024",
      postalCode: "179024",
      operationHours: "24 hrs",
      powerRating: "DC",
      chargingSpeedKw: 50,
      price: 0.8938,
      priceType: "$/kWh",
      status: "available",
    });
    expect(records[1]).toMatchObject({
      powerRating: "AC",
      chargingSpeedKw: 7.4,
      price: null,
      priceType: null,
      status: "unavailable",
    });
  });

  it("reads LastUpdatedTime as Singapore time", () => {
    expect(extractLastUpdated(batch)?.toISOString()).toBe(
      "2026-09-03T12:55:00.000Z",
    );
    expect(extractLastUpdated({})).toBeNull();
    expect(extractLastUpdated({ LastUpdatedTime: "nope" })).toBeNull();
  });
});

describe("deriveLocationId", () => {
  it("joins six longitude decimals to the postal code", () => {
    expect(deriveLocationId(103.846728, "179024")).toBe("846728179024");
    expect(deriveLocationId(103.8, "179024")).toBe("800000179024");
    expect(deriveLocationId(null, "179024")).toBe("179024");
    expect(deriveLocationId(103.8, null)).toBeNull();
  });
});

describe("toPriceType", () => {
  it("normalises per-kWh labels and keeps the rest", () => {
    expect(toPriceType("kWh")).toBe("$/kWh");
    expect(toPriceType("$/kWh")).toBe("$/kWh");
    expect(toPriceType("free")).toBe("free");
    expect(toPriceType("")).toBeNull();
  });
});

describe("extractStations", () => {
  it("returns an empty list for unrecognised payloads", () => {
    expect(extractStations(null)).toEqual([]);
    expect(extractStations("nope")).toEqual([]);
    expect(extractStations({ value: "nope" })).toEqual([]);
  });
});

describe("toConnectorStatus", () => {
  it("maps DataMall codes", () => {
    expect(toConnectorStatus(1)).toBe("available");
    expect(toConnectorStatus("0")).toBe("occupied");
    expect(toConnectorStatus("")).toBe("unavailable");
    expect(toConnectorStatus(undefined)).toBe("unavailable");
    expect(toConnectorStatus("100")).toBe("unavailable");
  });
});

describe("extractPostalCode", () => {
  it("takes the last six-digit run in the address", () => {
    expect(extractPostalCode("Blk 123456 Road, Singapore 654321")).toBe(
      "654321",
    );
    expect(extractPostalCode("No postal here")).toBeNull();
    expect(extractPostalCode(null)).toBeNull();
  });
});
