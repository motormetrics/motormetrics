vi.mock("@motormetrics/database", () => ({
  carCosts: {},
}));

vi.mock("@web/lib/updater", () => ({
  updateFromXlsx: vi.fn(),
}));

import { type UpdaterResult, updateFromXlsx } from "@web/lib/updater";
import { updateCarCosts } from "./process-data";

const mockResult = (overrides?: Partial<UpdaterResult>): UpdaterResult => ({
  table: "car_costs",
  recordsProcessed: 0,
  message: "",
  timestamp: new Date().toISOString(),
  ...overrides,
});

describe("updateCarCosts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call updateFromXlsx with correct configuration", async () => {
    vi.mocked(updateFromXlsx).mockResolvedValueOnce(mockResult());

    await updateCarCosts();

    expect(vi.mocked(updateFromXlsx).mock.calls[0][0]).toMatchObject({
      url: expect.stringContaining("Car_Cost_Update"),
    });
  });

  it("should return the result from updateFromXlsx", async () => {
    const expectedResult = mockResult({
      recordsProcessed: 10,
      message: "10 records inserted",
    });
    vi.mocked(updateFromXlsx).mockResolvedValueOnce(expectedResult);

    const result = await updateCarCosts();

    expect(updateFromXlsx).toHaveBeenCalledTimes(1);
    expect(result).toEqual(expectedResult);
  });
});
