import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRedisGet = vi.fn();
const mockRedisSet = vi.fn();

vi.mock("@motormetrics/utils", () => ({
  redis: {
    get: (...args: unknown[]) => mockRedisGet(...args),
    set: (...args: unknown[]) => mockRedisSet(...args),
  },
}));

const VALID_TOKEN = "test-token-123";

beforeEach(() => {
  vi.stubEnv("MOTORMETRICS_API_TOKEN", VALID_TOKEN);
  vi.clearAllMocks();
});

function makeRequest(
  method: string,
  body?: Record<string, unknown>,
  token?: string,
) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };
  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  return new Request("http://localhost/api/v1/maintenance", {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}

describe("GET /api/v1/maintenance", () => {
  it("should return 401 without auth token", async () => {
    const { GET } = await import("../route");
    const response = await GET(makeRequest("GET"));

    expect(response.status).toBe(401);
  });

  it("should return default config when Redis key is missing", async () => {
    mockRedisGet.mockResolvedValue(null);

    const { GET } = await import("../route");
    const response = await GET(makeRequest("GET", undefined, VALID_TOKEN));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ enabled: false, message: "" });
  });

  it("should return maintenance config from Redis", async () => {
    mockRedisGet.mockResolvedValue({
      maintenance: { enabled: true, message: "Down for updates" },
    });

    const { GET } = await import("../route");
    const response = await GET(makeRequest("GET", undefined, VALID_TOKEN));
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ enabled: true, message: "Down for updates" });
  });

  it("should return 500 when Redis throws", async () => {
    mockRedisGet.mockRejectedValue(new Error("Redis connection failed"));

    const { GET } = await import("../route");
    const response = await GET(makeRequest("GET", undefined, VALID_TOKEN));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Redis connection failed");
  });
});

describe("PUT /api/v1/maintenance", () => {
  it("should return 401 without auth token", async () => {
    const { PUT } = await import("../route");
    const response = await PUT(makeRequest("PUT", { enabled: true }));

    expect(response.status).toBe(401);
  });

  it("should return 400 when enabled is missing", async () => {
    const { PUT } = await import("../route");
    const response = await PUT(
      makeRequest("PUT", { message: "test" }, VALID_TOKEN),
    );
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe("enabled (boolean) is required");
  });

  it("should return 400 when enabled is not boolean", async () => {
    const { PUT } = await import("../route");
    const response = await PUT(
      makeRequest("PUT", { enabled: "yes" }, VALID_TOKEN),
    );

    expect(response.status).toBe(400);
  });

  it("should enable maintenance mode", async () => {
    mockRedisGet.mockResolvedValue({
      maintenance: { enabled: false, message: "" },
    });
    mockRedisSet.mockResolvedValue("OK");

    const { PUT } = await import("../route");
    const response = await PUT(
      makeRequest(
        "PUT",
        { enabled: true, message: "Scheduled maintenance" },
        VALID_TOKEN,
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ enabled: true, message: "Scheduled maintenance" });
    expect(mockRedisSet).toHaveBeenCalledWith("config", {
      maintenance: { enabled: true, message: "Scheduled maintenance" },
    });
  });

  it("should disable maintenance mode", async () => {
    mockRedisGet.mockResolvedValue({
      maintenance: { enabled: true, message: "Down for updates" },
    });
    mockRedisSet.mockResolvedValue("OK");

    const { PUT } = await import("../route");
    const response = await PUT(
      makeRequest("PUT", { enabled: false }, VALID_TOKEN),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ enabled: false, message: "" });
  });

  it("should preserve other config keys", async () => {
    mockRedisGet.mockResolvedValue({
      maintenance: { enabled: false, message: "" },
      someOtherKey: "preserved",
    });
    mockRedisSet.mockResolvedValue("OK");

    const { PUT } = await import("../route");
    await PUT(
      makeRequest("PUT", { enabled: true, message: "test" }, VALID_TOKEN),
    );

    expect(mockRedisSet).toHaveBeenCalledWith("config", {
      maintenance: { enabled: true, message: "test" },
      someOtherKey: "preserved",
    });
  });

  it("should initialise config when Redis key is missing", async () => {
    mockRedisGet.mockResolvedValue(null);
    mockRedisSet.mockResolvedValue("OK");

    const { PUT } = await import("../route");
    const response = await PUT(
      makeRequest("PUT", { enabled: true, message: "first time" }, VALID_TOKEN),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ enabled: true, message: "first time" });
  });

  it("should return 500 when Redis throws", async () => {
    mockRedisGet.mockRejectedValue(new Error("Redis write failed"));

    const { PUT } = await import("../route");
    const response = await PUT(
      makeRequest("PUT", { enabled: true }, VALID_TOKEN),
    );
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("Redis write failed");
  });
});
