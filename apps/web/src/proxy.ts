import crypto from "node:crypto";
import { and, db, eq, gt, sessions } from "@motormetrics/database";
import { redis } from "@motormetrics/utils";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { auth } from "@web/app/admin/lib/auth";
import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";

// Rate limiter for Developer API (60 requests per minute)
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"),
});

interface AppConfig {
  maintenance: {
    enabled: boolean;
    message: string;
  };
}

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

  const isAdminRoute = pathname.startsWith("/admin");
  const isAuthRoute = pathname.startsWith("/api/auth");

  if (isAdminRoute || isAuthRoute) {
    // Allow public access to login page and auth API
    if (pathname === "/admin/login" || isAuthRoute) {
      return NextResponse.next();
    }

    // Check admin session for protected admin routes
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  const config = await redis.get<AppConfig>("config");
  const isMaintenanceMode = config?.maintenance?.enabled ?? false;
  const isOnMaintenancePage =
    request.nextUrl.pathname.startsWith("/maintenance");

  // Check for admin session bypass (via cross-subdomain cookie from admin.motormetrics.app)
  let hasAdminSession = false;
  if (isMaintenanceMode) {
    const sessionToken = request.cookies.get(
      "better-auth.session_token",
    )?.value;
    if (sessionToken) {
      const [session] = await db
        .select({ id: sessions.id })
        .from(sessions)
        .where(
          and(
            eq(sessions.token, sessionToken),
            gt(sessions.expiresAt, new Date()),
          ),
        )
        .limit(1);

      hasAdminSession = !!session;
    }
  }

  // Maintenance enabled, user NOT on maintenance page, NO admin session → redirect TO maintenance
  if (isMaintenanceMode && !isOnMaintenancePage && !hasAdminSession) {
    const maintenanceUrl = new URL("/maintenance", request.url);
    maintenanceUrl.searchParams.set("from", request.url);
    return NextResponse.redirect(maintenanceUrl);
  }

  // Maintenance disabled, user ON maintenance page → redirect AWAY from maintenance
  if (!isMaintenanceMode && isOnMaintenancePage) {
    const fromUrl = request.nextUrl.searchParams.get("from");
    const redirectUrl = fromUrl ? new URL(fromUrl) : new URL("/", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  const nonce = crypto.randomBytes(16).toString("base64");
  const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' *.motormetrics.app *.vercel-scripts.com vercel.live;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: *.unsplash.com;
      connect-src *;
      font-src 'self';
      frame-src 'self' vercel.live;
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
  // `;

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  );

  requestHeaders.set(
    "Content-Security-Policy",
    cspHeader.replace(/\s{2,}/g, " ").trim(),
  );

  requestHeaders.set("X-Robots-Tag", "all");

  return NextResponse.next({
    ...(!process.env.VERCEL && { headers: requestHeaders }),
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
