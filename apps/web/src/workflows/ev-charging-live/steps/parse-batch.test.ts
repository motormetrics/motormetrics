import {
  extractPostalCode,
  extractStations,
  parseBatch,
  toConnectorStatus,
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
