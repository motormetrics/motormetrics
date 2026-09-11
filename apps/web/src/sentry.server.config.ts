import * as Sentry from "@sentry/nextjs";

// The OpenTelemetry provider is registered in instrumentation.ts, so Sentry
// attaches to it instead of setting up its own.
export const sentryClient = Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  skipOpenTelemetrySetup: true,
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.1,
  // Local variable capture attaches the V8 inspector on every cold start
  // (the "Debugger listening on ws://" log lines), which costs CPU on
  // Fluid Compute — left off.
  enableLogs: true,
});
