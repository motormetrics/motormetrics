import crypto from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { auth } from "@web/lib/auth";
import { type NextRequest, NextResponse } from "next/server";

// Rate limiter for Developer API (60 requests per minute)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
});

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/v1")) {
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1";
    const { success, limit, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      );
    }

    // For successful requests, add rate limit headers via rewrite
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", limit.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", reset.toString());
    return response;
  }

  const wantsMarkdown =
    request.method === "GET" &&
    request.headers.get("accept")?.includes("text/markdown");

  // Agents asking for Markdown get the llms.txt summary of the homepage
  // (acceptmarkdown.com). Fetched rather than rewritten so the route's
  // text/plain Content-Type cannot win over text/markdown.
  if (wantsMarkdown && pathname === "/") {
    const llmsTxt = await fetch(new URL("/llms.txt", request.url));
    return new Response(await llmsTxt.text(), {
      status: llmsTxt.status,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept",
      },
    });
  }

  // A proxy cannot know whether a path 404s, so probe it as HTML first and
  // answer a miss with a Markdown error body. Only Markdown requests pay for
  // the probe; HTML requests skip it, which also stops the probe recursing.
  if (
    wantsMarkdown &&
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/admin")
  ) {
    const probe = await fetch(request.url, {
      method: "HEAD",
      headers: { accept: "text/html" },
      redirect: "manual",
    });

    if (probe.status === 404) {
      const llmsTxtUrl = new URL("/llms.txt", request.url);
      const sitemapUrl = new URL("/sitemap.xml", request.url);
      return new Response(
        `# Page not found\n\nNo page exists at \`${pathname}\`. See [llms.txt](${llmsTxtUrl}) for a guide to the site, or the [sitemap](${sitemapUrl}) for every page.\n`,
        {
          status: 404,
          headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            Vary: "Accept",
          },
        },
      );
    }
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/api/auth");

  if (isAdminRoute || isAuthRoute) {
    // Allow public access to login page and auth API
    if (pathname === "/admin/login" || isAuthRoute) {
      return NextResponse.next();
    }

    // Check admin session for protected admin routes
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const nonce = crypto.randomBytes(16).toString("base64");
  const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' *.motormetrics.app *.vercel-scripts.com vercel.live;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: *.unsplash.com;
      connect-src *;
      font-src 'self';
      frame-src 'self' vercel.live;
      worker-src 'self' blob:;
  `;
  // TODO: Use this CSP after migrating to Vercel
  // const cspHeader = `
  //     default-src 'self';
  //     script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
  //     style-src 'self' 'unsafe-inline';
  //     img-src 'self' blob: data:;
  //     connect-src *;
  //     font-src 'self';
  //     frame-src 'self' 'strict-dynamic';
  //     worker-src 'self' blob:;
  // `;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self), browsing-topics=()",
  );

  requestHeaders.set(
    "Content-Security-Policy",
    cspHeader.replace(/\s{2,}/g, " ").trim(),
  );

  requestHeaders.set("X-Robots-Tag", "all");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|ingest(?:/|$)|monitoring(?:/|$)|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
