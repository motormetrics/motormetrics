vi.mock("@motormetrics/database", () => ({
  carPopulation: {
    year: "year",
    make: "make",
    fuelType: "fuelType",
  },
}));

vi.mock("@web/lib/updater", () => ({
  update: vi.fn(),
}));

import { type UpdaterResult, update } from "@web/lib/updater";
import { updateCarPopulation } from "./process-data";

const mockResult = (overrides?: Partial<UpdaterResult>): UpdaterResult => ({
  table: "car_population",
  recordsProcessed: 0,
  message: "",
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe("updateCarPopulation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call update with correct configuration", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateCarPopulation();

    expect(vi.mocked(update).mock.calls[0][0]).toMatchObject({
      url: expect.stringContaining("Annual Car Population by Make"),
    });
  });

  it("should return the result from update", async () => {
    const expectedResult = mockResult({
      recordsProcessed: 5,
      message: "5 records inserted",
    });
    vi.mocked(update).mockResolvedValueOnce(expectedResult);

    const result = await updateCarPopulation();

    expect(update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });

  it("should configure CSV transform options with column mappings", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateCarPopulation();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: { columnMapping?: Record<string, string> };
    };
    expect(config.csvTransformOptions?.columnMapping).toEqual({
      fuel_type: "fuelType",
    });
  });

  it("should transform empty number values to 0", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateCarPopulation();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: {
        fields?: Record<string, (value: string) => number>;
      };
    };
    const numberTransform = config.csvTransformOptions?.fields?.number;

    expect(numberTransform).toBeDefined();
    expect(numberTransform?.("")).toBe(0);
    expect(numberTransform?.("100")).toBe(100);
  });
});
