import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@upstash/redis", () => ({
  Redis: { fromEnv: vi.fn() },
}));

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: class {
    static slidingWindow = vi.fn();
    limit = vi.fn();
  },
}));

vi.mock("@web/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

function makeServerActionRequest() {
  return new NextRequest("http://localhost/blog/example", {
    method: "POST",
    headers: {
      accept: "text/x-component",
      "content-type": "text/plain;charset=UTF-8",
      "next-action": "abc123",
    },
  });
}

describe("proxy", () => {
  it("should not echo request headers onto the response", async () => {
    const { proxy } = await import("@web/proxy");

    const response = await proxy(makeServerActionRequest());

    expect(response.headers.get("content-type")).toBeNull();
    expect(response.headers.get("next-action")).toBeNull();
    expect(response.headers.get("accept")).toBeNull();
    expect(response.headers.get("Content-Security-Policy")).toBeNull();
  });

  it("should forward x-nonce to the app via the request headers", async () => {
    const { proxy } = await import("@web/proxy");

    const response = await proxy(makeServerActionRequest());

    expect(response.headers.get("x-middleware-request-x-nonce")).toBeTruthy();
    expect(response.headers.get("x-nonce")).toBeNull();
  });
});
