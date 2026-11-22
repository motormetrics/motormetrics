import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@motormetrics/utils/redis", () => ({
  redis: { set: vi.fn() },
}));

vi.mock("@web/workflows/coe-interim-results/steps/store", () => ({
  storeInterimResults: vi.fn(),
}));

vi.mock("@web/workflows/coe-interim-results/steps/report", () => ({
  reportParseFailure: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
}));

vi.mock("workflow", () => ({
  getWritable: vi.fn(() => ({
    getWriter: () => ({
      write: vi.fn().mockResolvedValue(undefined),
      releaseLock: vi.fn(),
    }),
  })),
  FatalError: class FatalError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "FatalError";
    }
  },
  RetryableError: class RetryableError extends Error {},
}));

import { redis } from "@motormetrics/utils/redis";
import { coeInterimResultsWorkflow } from "@web/workflows/coe-interim-results";
import { reportParseFailure } from "@web/workflows/coe-interim-results/steps/report";
import { storeInterimResults } from "@web/workflows/coe-interim-results/steps/store";
import { revalidateTag } from "next/cache";

const row = (letter: string) =>
  `<tr><td>${letter}</td><td>DESCRIPTION</td><td>100</td><td>90,000</td><td>0</td></tr>`;
const bidRow = (letter: string) =>
  `<tr><td>${letter}</td><td>DESCRIPTION</td><td>150</td><td>100</td><td>50</td><td>0</td></tr>`;
const letters = ["A", "B", "C", "D", "E"];

const page = (endedOn: string, quotaRows = letters.map(row).join("")) => `
  <p>NOVEMBER 2026 2nd Open Bidding Exercise has ended on ${endedOn} 16:00:00 hrs</p>
  <h3>Results for NOVEMBER 2026 2nd Open Bidding Exercise</h3>
  <table><tr><th colspan="2">Category</th><th>Quota</th><th>QP($)</th><th>PQP($)</th></tr>${quotaRows}</table>
  <table><tr><th colspan="2">Category</th><th>Received</th><th>Successful</th><th>Unsuccessful</th><th>Unused</th></tr>${letters.map(bidRow).join("")}</table>`;

const servePage = (html: string, status = 200) =>
  vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValue(new Response(html, { status }));

describe("coeInterimResultsWorkflow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useFakeTimers({ toFake: ["Date"] });
    // 18 November 2026, 16:05 SGT.
    vi.setSystemTime(new Date("2026-11-18T08:05:00Z"));
  });

  it("should store today's results, stamp the update time and revalidate", async () => {
    servePage(page("18/11/2026"));
    vi.mocked(storeInterimResults).mockResolvedValueOnce(5);

    const result = await coeInterimResultsWorkflow();

    expect(result.message).toBe(
      "[COE INTERIM] Stored 5 results for 2026-11 exercise 2",
    );
    expect(storeInterimResults).toHaveBeenCalledWith(
      "2026-11",
      2,
      expect.arrayContaining([
        expect.objectContaining({ vehicleClass: "Category A", premium: 90000 }),
      ]),
    );
    expect(redis.set).toHaveBeenCalledWith(
      "last_updated:coe",
      expect.any(Number),
    );
    expect(revalidateTag).toHaveBeenCalledWith("coe:month:2026-11", "max");
    expect(revalidateTag).toHaveBeenCalledWith("coe:latest", "max");
  });

  it("should skip when the exercise is already stored", async () => {
    servePage(page("18/11/2026"));
    vi.mocked(storeInterimResults).mockResolvedValueOnce(0);

    const result = await coeInterimResultsWorkflow();

    expect(result.message).toContain("already stored");
    expect(redis.set).not.toHaveBeenCalled();
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("should skip on a day that is not a results day", async () => {
    servePage(page("04/11/2026"));

    const result = await coeInterimResultsWorkflow();

    expect(result.message).toContain("closed on 2026-11-04, not today");
    expect(storeInterimResults).not.toHaveBeenCalled();
    expect(reportParseFailure).not.toHaveBeenCalled();
  });

  it("should report and fail fatally when the page cannot be read", async () => {
    servePage(page("18/11/2026", letters.slice(0, 4).map(row).join("")));

    await expect(coeInterimResultsWorkflow()).rejects.toMatchObject({
      name: "FatalError",
    });
    expect(reportParseFailure).toHaveBeenCalledWith(
      "quota-table",
      expect.stringContaining("Expected categories A to E"),
    );
    expect(storeInterimResults).not.toHaveBeenCalled();
  });

  it("should throw a retryable error when OneMotoring is unavailable", async () => {
    servePage("", 503);

    await expect(coeInterimResultsWorkflow()).rejects.toThrow("HTTP 503");
    expect(reportParseFailure).not.toHaveBeenCalled();
  });
});
