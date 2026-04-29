vi.mock("@motormetrics/database", () => ({
  cars: { name: "cars" },
}));

vi.mock("@motormetrics/utils", () => ({
  cleanSpecialChars: vi.fn(
    (
      value: string,
      options?: { separator?: string; joinSeparator?: string },
    ) => {
      if (options?.separator === ".") {
        return value.replace(/\./g, "");
      }
      if (options?.separator === "/") {
        return value.replace(/\s*\/\s*/g, options.joinSeparator ?? "");
      }
      return value;
    },
  ),
}));

vi.mock("@web/config/workflow", () => ({
  LTA_DATAMALL_BASE_URL: "https://example.com/datamall",
}));

vi.mock("@web/lib/updater", () => ({
  update: vi.fn(),
}));

import { cleanSpecialChars } from "@motormetrics/utils";
import { type UpdaterResult, update } from "@web/lib/updater";
import { updateCars } from "./process-data";

const mockResult = (overrides?: Partial<UpdaterResult>): UpdaterResult => ({
  table: "cars",
  recordsProcessed: 0,
  message: "",
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe("updateCars", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call update with correct configuration", async () => {
    vi.mocked(update).mockResolvedValueOnce(
      mockResult({ recordsProcessed: 10, message: "10 records inserted" }),
    );

    await updateCars();

    expect(vi.mocked(update).mock.calls[0][0]).toMatchObject({
      url: "https://example.com/datamall/Monthly New Registration of Cars by Make.zip",
    });
  });

  it("should return the result from update", async () => {
    const expectedResult = mockResult({
      recordsProcessed: 5,
      message: "5 records inserted",
    });
    vi.mocked(update).mockResolvedValueOnce(expectedResult);

    const result = await updateCars();

    expect(update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });

  it("should configure CSV transform options with column mappings", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateCars();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: { columnMapping?: Record<string, string> };
    };
    expect(config.csvTransformOptions?.columnMapping).toEqual({
      fuel_type: "fuelType",
      vehicle_type: "vehicleType",
      importer_type: "importerType",
    });
  });

  it("should transform make field to uppercase with special chars cleaned", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateCars();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: {
        fields?: Record<string, (value: string) => string>;
      };
    };
    const makeTransform = config.csvTransformOptions?.fields?.make;

    expect(makeTransform).toBeDefined();
    expect(makeTransform?.("B.M.W.")).toBe("BMW");
    expect(cleanSpecialChars).toHaveBeenCalledWith("B.M.W.", {
      separator: ".",
    });
  });

  it("should transform vehicleType with slash separator", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateCars();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: {
        fields?: Record<string, (value: string) => string>;
      };
    };
    const vehicleTypeTransform =
      config.csvTransformOptions?.fields?.vehicleType;

    expect(vehicleTypeTransform).toBeDefined();
    expect(vehicleTypeTransform?.("Saloon / Sports")).toBe("Saloon/Sports");
  });

  it("should transform empty number values to 0", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateCars();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: {
        fields?: Record<string, (value: string | number) => number>;
      };
    };
    const numberTransform = config.csvTransformOptions?.fields?.number;

    expect(numberTransform).toBeDefined();
    expect(numberTransform?.("")).toBe(0);
    expect(numberTransform?.(42)).toBe(42);
    expect(numberTransform?.("100")).toBe(100);
  });
});
