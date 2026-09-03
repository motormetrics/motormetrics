vi.mock("@motormetrics/database", () => ({
  evChargingPoints: { name: "ev_charging_points" },
}));

vi.mock("@web/lib/updater", () => ({
  update: vi.fn(),
}));

import { type UpdaterResult, update } from "@web/lib/updater";
import {
  toIsoDate,
  toNumberOrNull,
  toOutlets,
  toPubliclyAccessible,
  toTextOrNull,
  updateEvChargingPoints,
} from "./process-data";

const mockResult = (overrides?: Partial<UpdaterResult>): UpdaterResult => ({
  table: "ev_charging_points",
  recordsProcessed: 0,
  message: "",
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe("updateEvChargingPoints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should download the quarterly charging points archive", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateEvChargingPoints();

    expect(vi.mocked(update).mock.calls[0][0]).toMatchObject({
      url: "https://datamall.lta.gov.sg/content/dam/datamall/datasets/Facts_Figures/Electric-Vehicle-Charging-Network/EVChargingPoints.zip",
    });
  });

  it("should return the result from update", async () => {
    const expected = mockResult({
      recordsProcessed: 11353,
      message: "11353 record(s) inserted",
    });
    vi.mocked(update).mockResolvedValueOnce(expected);

    const result = await updateEvChargingPoints();

    expect(update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expected);
  });

  it("should keep postal codes intact by disabling dynamic typing", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateEvChargingPoints();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: { dynamicTyping?: boolean };
    };
    expect(config.csvTransformOptions?.dynamicTyping).toBe(false);
  });

  it("should map the DataMall headers onto schema columns", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateEvChargingPoints();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: { columnMapping?: Record<string, string> };
    };
    expect(config.csvTransformOptions?.columnMapping).toMatchObject({
      "EV Charger Registration Code": "registrationCode",
      "No. of Charging Outlets": "outlets",
      "charging Speed": "chargingSpeedKw",
      PostalCode: "postalCode",
      "Is the charger publicly accessible?": "publiclyAccessible",
      "Registration Date": "registrationDate",
    });
  });
});

describe("field transforms", () => {
  it("should parse d/M/yyyy registration dates into ISO dates", () => {
    expect(toIsoDate("10/6/2025")).toBe("2025-06-10");
    expect(toIsoDate("14/02/2024")).toBe("2024-02-14");
  });

  it("should return null for blank or malformed registration dates", () => {
    expect(toIsoDate("")).toBeNull();
    expect(toIsoDate("   ")).toBeNull();
    expect(toIsoDate("not a date")).toBeNull();
    expect(toIsoDate("31/13/2025")).toBeNull();
  });

  it("should convert numeric strings and null out blanks", () => {
    expect(toNumberOrNull("22")).toBe(22);
    expect(toNumberOrNull("7.4")).toBe(7.4);
    expect(toNumberOrNull("103.8525029")).toBe(103.8525029);
    expect(toNumberOrNull("")).toBeNull();
    expect(toNumberOrNull("n/a")).toBeNull();
  });

  it("should default outlets to 1 when missing", () => {
    expect(toOutlets("2")).toBe(2);
    expect(toOutlets("")).toBe(1);
  });

  it("should null out blank optional text such as parking lot type", () => {
    expect(toTextOrNull("")).toBeNull();
    expect(toTextOrNull("  ")).toBeNull();
    expect(toTextOrNull(" B3 ")).toBe("B3");
  });

  it("should read the public accessibility flag", () => {
    expect(toPubliclyAccessible("Yes")).toBe(true);
    expect(toPubliclyAccessible("yes ")).toBe(true);
    expect(toPubliclyAccessible("No")).toBe(false);
    expect(toPubliclyAccessible("")).toBe(false);
  });
});
