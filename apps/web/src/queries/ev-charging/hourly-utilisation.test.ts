import { cacheLifeMock, queueSelect, resetDbMocks } from "../test-utils";
import { getEvChargingUtilisationByHour } from "./hourly-utilisation";

describe("getEvChargingUtilisationByHour", () => {
  beforeEach(() => {
    resetDbMocks();
  });

  it("should return 24 hours, zero-filling the ones without samples", async () => {
    queueSelect([
      { hour: 1, utilisationPercent: 32 },
      { hour: 19, utilisationPercent: 24.5 },
    ]);

    const rows = await getEvChargingUtilisationByHour();

    expect(rows).toHaveLength(24);
    expect(rows[0]).toEqual({ hour: 0, utilisationPercent: 0 });
    expect(rows[1]).toEqual({ hour: 1, utilisationPercent: 32 });
    expect(rows[19]).toEqual({ hour: 19, utilisationPercent: 24.5 });
    expect(cacheLifeMock).toHaveBeenCalledWith("hours");
  });

  it("should accept a custom window", async () => {
    queueSelect([]);

    const rows = await getEvChargingUtilisationByHour(1);

    expect(rows.every((row) => row.utilisationPercent === 0)).toBe(true);
  });
});
