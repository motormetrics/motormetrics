import { beforeEach, describe, expect, it, vi } from "vitest";

const start = vi.hoisted(() => vi.fn(async () => ({ runId: "run-1" })));

vi.mock("workflow/api", () => ({ start }));
vi.mock("@web/workflows/coe-interim-results", () => ({
  coeInterimResultsWorkflow: vi.fn(),
}));

import { GET } from "@web/app/api/workflows/coe-interim-results/route";

const request = (authorization?: string) =>
  new Request("https://motormetrics.app/api/workflows/coe-interim-results", {
    headers: authorization ? { authorization } : {},
  });

describe("GET /api/workflows/coe-interim-results", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("CRON_SECRET", "secret");
  });

  it("should start the workflow with the cron secret", async () => {
    const response = await GET(request("Bearer secret"));

    expect(response.status).toBe(200);
    expect(start).toHaveBeenCalledOnce();
  });

  it("should reject a wrong secret", async () => {
    const response = await GET(request("Bearer wrong"));

    expect(response.status).toBe(401);
    expect(start).not.toHaveBeenCalled();
  });

  it("should reject every request when the secret is unset", async () => {
    vi.stubEnv("CRON_SECRET", "");

    const response = await GET(request("Bearer undefined"));

    expect(response.status).toBe(401);
    expect(start).not.toHaveBeenCalled();
  });
});
