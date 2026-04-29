import posthog from "posthog-js";

if (process.env.NEXT_PUBLIC_VERCEL_ENV === "production") {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_TOKEN ?? "", {
    api_host: "/ingest",
    ui_host: "https://eu.posthog.com",
    defaults: "2026-01-30",
    capture_pageview: true,
    capture_pageleave: true,
    capture_exceptions: true,
  });
}
