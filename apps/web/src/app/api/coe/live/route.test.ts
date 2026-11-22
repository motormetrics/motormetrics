import { beforeEach, describe, expect, it, vi } from "vitest";

const storedRows = vi.hoisted(() => ({ value: [] as { id: string }[] }));
const seal = vi.hoisted(() => vi.fn());

vi.mock("@motormetrics/database/client", () => ({
  db: {
    select: () => ({
      from: () => ({ limit: async () => storedRows.value }),
    }),
  },
}));

vi.mock("@neon/realtime/server", () => ({
  createRealtime: vi.fn(() => ({ seal })),
  rawSql: vi.fn((sql: string) => ({ sql, parameters: [] })),
}));

vi.mock("next/server", () => ({
  connection: vi.fn(async () => {}),
}));

import { createRealtime } from "@neon/realtime/server";
import { GET } from "@web/app/api/coe/live/route";

const SEALED = { capability: "sealed", expiresAt: 1, queryFingerprint: "fp" };

// Wednesday 18 November 2026, as SGT wall-clock time.
const at = (time: string, date = "2026-11-18") =>
  vi.setSystemTime(new Date(`${date}T${time}:00+08:00`));

describe("GET /api/coe/live", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.stubEnv("NEON_REALTIME_SECRET", "secret");
    vi.stubEnv("DATABASE_URL", "postgresql://user:pass@host/neondb");
    storedRows.value = [];
    seal.mockResolvedValue(SEALED);
  });

  it("should seal the interim results query inside the window", async () => {
    at("16:00");

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual(SEALED);
    expect(createRealtime).toHaveBeenCalledWith({
      secret: "secret",
      db: "neondb",
    });
    expect(seal).toHaveBeenCalledWith({
      query: expect.objectContaining({
        sql: "select month, bidding_no from coe_interim_results",
      }),
    });
  });

  it.each([
    ["before the window", "15:50", "2026-11-18"],
    ["after the window", "16:45", "2026-11-18"],
    ["at the weekend", "16:00", "2026-11-21"],
  ])("should return 204 %s", async (_, time, date) => {
    at(time, date);

    const response = await GET();

    expect(response.status).toBe(204);
    expect(seal).not.toHaveBeenCalled();
  });

  it("should return 204 once the day's results are stored", async () => {
    at("16:10");
    storedRows.value = [{ id: "row" }];

    const response = await GET();

    expect(response.status).toBe(204);
    expect(seal).not.toHaveBeenCalled();
  });

  it("should return 204 when Realtime is not configured", async () => {
    at("16:00");
    vi.stubEnv("NEON_REALTIME_SECRET", "");

    const response = await GET();

    expect(response.status).toBe(204);
    expect(seal).not.toHaveBeenCalled();
  });
});
