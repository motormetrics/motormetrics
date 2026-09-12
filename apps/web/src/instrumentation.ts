import { OpenTelemetry } from "@ai-sdk/otel";
import * as Sentry from "@sentry/nextjs";
import { registerTelemetry } from "ai";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }

  registerTelemetry(new OpenTelemetry({ runtimeContext: true }));
}

export const onRequestError = Sentry.captureRequestError;
