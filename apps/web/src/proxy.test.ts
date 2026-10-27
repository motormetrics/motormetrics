import { unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
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

  describe("make comparison", () => {
    async function compare(query: string) {
      const { proxy } = await import("@web/proxy");
      return proxy(
        new NextRequest(`http://localhost/cars/makes/compare?${query}`, {
          headers: { accept: "text/html" },
        }),
      );
    }

    it("should redirect a curated pair in canonical order to its page", async () => {
      const response = await compare("make=bmw&make=mercedes-benz");

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe(
        "http://localhost/cars/makes/compare/bmw-vs-mercedes-benz",
      );
    });

    it("should normalise case, whitespace and repeats before matching", async () => {
      const response = await compare("make=%20BMW&make=bmw&make=Audi");

      expect(response.headers.get("location")).toBe(
        "http://localhost/cars/makes/compare/bmw-vs-audi",
      );
    });

    it.each([
      "make=mercedes-benz&make=bmw",
      "make=bmw&make=volvo",
      "make=bmw",
    ])("should leave %s to the page", async (query) => {
      const response = await compare(query);

      expect(response.headers.get("location")).toBeNull();
    });
  });

  describe("matcher", () => {
    async function matches(url: string, headers?: Record<string, string>) {
      const { config } = await import("@web/proxy");
      return unstable_doesMiddlewareMatch({ config, url, headers });
    }

    it.each([
      "/api/v1/cars",
      "/admin",
      "/admin/login",
      "/admin/posts",
      "/api/auth/session",
    ])("should run for %s", async (url) => {
      expect(await matches(url)).toBe(true);
    });

    it.each([
      "/",
      "/coe",
      "/cars/makes/bmw",
      "/api/health",
    ])("should not run for a browser request to %s", async (url) => {
      expect(await matches(url, { accept: "text/html" })).toBe(false);
    });

    it("should run for a make comparison with a make query", async () => {
      expect(
        await matches("/cars/makes/compare?make=bmw&make=audi", {
          accept: "text/html",
        }),
      ).toBe(true);
    });

    it("should not run for the make comparison page without a make query", async () => {
      expect(
        await matches("/cars/makes/compare", { accept: "text/html" }),
      ).toBe(false);
    });

    it("should not run for RSC navigations and prefetches", async () => {
      expect(
        await matches("/coe", {
          accept: "text/x-component",
          rsc: "1",
          "next-router-prefetch": "1",
        }),
      ).toBe(false);
    });

    it.each([
      "/",
      "/coe",
      "/no-such-page",
    ])("should run for a Markdown request to %s", async (url) => {
      expect(
        await matches(url, { accept: "text/markdown, text/html;q=0.9" }),
      ).toBe(true);
    });

    it.each([
      "/api/health",
      "/_next/static/chunk.js",
      "/sitemap.xml",
    ])("should not run for a Markdown request to %s", async (url) => {
      expect(await matches(url, { accept: "text/markdown" })).toBe(false);
    });
  });
});
