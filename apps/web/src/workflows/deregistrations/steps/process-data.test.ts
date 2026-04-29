vi.mock("@motormetrics/database", () => ({
  deregistrations: { name: "deregistrations" },
}));

vi.mock("@web/config/workflow", () => ({
  LTA_DATAMALL_BASE_URL: "https://example.com/datamall",
}));

vi.mock("@web/lib/updater", () => ({
  update: vi.fn(),
}));

import { type UpdaterResult, update } from "@web/lib/updater";
import { updateDeregistration } from "./process-data";

const mockResult = (overrides?: Partial<UpdaterResult>): UpdaterResult => ({
  table: "deregistrations",
  recordsProcessed: 0,
  message: "",
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe("updateDeregistration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call update with correct configuration", async () => {
    vi.mocked(update).mockResolvedValueOnce(
      mockResult({ recordsProcessed: 10, message: "10 records inserted" }),
    );

    await updateDeregistration();

    expect(vi.mocked(update).mock.calls[0][0]).toMatchObject({
      url: "https://example.com/datamall/Monthly De-Registered Motor Vehicles under Vehicle Quota System (VQS).zip",
    });
  });

  it("should return the result from update", async () => {
    const expectedResult = mockResult({
      recordsProcessed: 5,
      message: "5 records inserted",
    });
    vi.mocked(update).mockResolvedValueOnce(expectedResult);

    const result = await updateDeregistration();

    expect(update).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });

  it("should not have column mappings", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateDeregistration();

    const config = vi.mocked(update).mock.calls[0][0] as {
      csvTransformOptions?: { columnMapping?: Record<string, string> };
    };
    expect(config.csvTransformOptions?.columnMapping).toBeUndefined();
  });

  it("should transform empty number values to 0", async () => {
    vi.mocked(update).mockResolvedValueOnce(mockResult());

    await updateDeregistration();

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
