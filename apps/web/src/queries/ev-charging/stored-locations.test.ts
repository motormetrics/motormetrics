import { db, evConnectorStatus } from "@motormetrics/database";
import { resetDbMocks } from "../test-utils";
import {
  districtPredicate,
  storedLocationColumns,
  storedLocationsSubquery,
  toStoredLocation,
} from "./stored-locations";

describe("storedLocationsSubquery", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should build one grouped select over the status table", () => {
    storedLocationsSubquery();

    expect(vi.mocked(db.select)).toHaveBeenCalledTimes(1);
  });

  it("should expose every column for select and groupBy", () => {
    const columns = storedLocationColumns(storedLocationsSubquery());

    expect(Object.keys(columns)).toEqual([
      "locationId",
      "stationName",
      "address",
      "postalCode",
      "operator",
      "connectors",
      "dcConnectors",
      "maxSpeedKw",
      "minPricePerKwh",
    ]);
  });
});

describe("districtPredicate", () => {
  it("should return undefined for no district or an unknown slug", () => {
    expect(
      districtPredicate(evConnectorStatus.postalCode, undefined),
    ).toBeUndefined();
    expect(
      districtPredicate(evConnectorStatus.postalCode, "nowhere"),
    ).toBeUndefined();
  });

  it("should build a predicate for a known district", () => {
    expect(
      districtPredicate(evConnectorStatus.postalCode, "middle-road-bugis"),
    ).toBeDefined();
  });
});

describe("toStoredLocation", () => {
  it("should copy the location columns through", () => {
    const row = {
      locationId: "L1",
      stationName: "Station",
      address: "1 Road",
      postalCode: "188537",
      operator: "Op",
      connectors: 2,
      dcConnectors: 1,
      maxSpeedKw: 120,
      minPricePerKwh: 0.5,
    };

    expect(toStoredLocation(row)).toEqual(row);
  });
});
