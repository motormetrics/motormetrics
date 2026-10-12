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

  it("should serve llms.txt as Markdown when the homepage is requested with Accept: text/markdown", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response("# MotorMetrics"));
    const { proxy } = await import("@web/proxy");

    const response = await proxy(
      new NextRequest("http://localhost/", {
        headers: { accept: "text/markdown" },
      }),
    );

    expect(fetchSpy).toHaveBeenCalledWith(new URL("http://localhost/llms.txt"));
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("vary")).toBe("Accept");
    expect(await response.text()).toBe("# MotorMetrics");
    fetchSpy.mockRestore();
  });

  it("should answer a missing page with a Markdown 404 when Markdown is requested", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 404 }));
    const { proxy } = await import("@web/proxy");

    const response = await proxy(
      new NextRequest("http://localhost/no-such-page", {
        headers: { accept: "text/markdown" },
      }),
    );

    expect(fetchSpy).toHaveBeenCalledWith("http://localhost/no-such-page", {
      method: "HEAD",
      headers: { accept: "text/html" },
      redirect: "manual",
    });
    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(response.headers.get("vary")).toBe("Accept");
    expect(await response.text()).toContain("http://localhost/llms.txt");
    fetchSpy.mockRestore();
  });

  it("should pass an existing page through when Markdown is requested", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));
    const { proxy } = await import("@web/proxy");

    const response = await proxy(
      new NextRequest("http://localhost/coe", {
        headers: { accept: "text/markdown" },
      }),
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBeNull();
    fetchSpy.mockRestore();
  });

  it("should not probe pages for browsers", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { proxy } = await import("@web/proxy");

    await proxy(
      new NextRequest("http://localhost/no-such-page", {
        headers: { accept: "text/html" },
      }),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("should not serve Markdown to browsers requesting the homepage", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { proxy } = await import("@web/proxy");

    const response = await proxy(
      new NextRequest("http://localhost/", {
        headers: { accept: "text/html" },
      }),
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(response.headers.get("content-type")).toBeNull();
    fetchSpy.mockRestore();
  });
});
