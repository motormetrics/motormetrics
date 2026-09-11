import { OpenTelemetry } from "@ai-sdk/otel";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import * as Sentry from "@sentry/nextjs";
import {
  SentryPropagator,
  SentrySampler,
  SentrySpanProcessor,
} from "@sentry/opentelemetry";
import { registerTelemetry } from "ai";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((base) => base.toString(16).padStart(2, "0"))
    .join("");

export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
    return;
  }

  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { sentryClient } = await import("./sentry.server.config");

  const langfuseSpanProcessor = new LangfuseSpanProcessor({
    shouldExportSpan: ({ otelSpan }) =>
      ["langfuse-sdk", "ai"].includes(otelSpan.instrumentationScope.name),
    // Export spans immediately in serverless environments (no batching)
    exportMode: "immediate",
  });

  // DIAGNOSTIC (temporary, do not merge): tracing is off unless
  // OTEL_TRACING_ENABLED=1. The OpenTelemetry tracer reads the clock for span
  // start times, and we are testing whether that Date.now() call is what makes
  // the opengraph-image and twitter-image routes bail out of static rendering
  // on revalidation. The idGenerator below already works around the same class
  // of bug for Math.random(), which is what points at the tracer here.
  if (process.env.OTEL_TRACING_ENABLED === "1") {
    const tracerProvider = new NodeTracerProvider({
      // Sentry decides sampling so trace propagation stays consistent.
      sampler: sentryClient ? new SentrySampler(sentryClient) : undefined,
      spanProcessors: [new SentrySpanProcessor(), langfuseSpanProcessor],
      // Use Web Crypto API to avoid Math.random() which triggers
      // Next.js prerender bailout in Server Components.
      idGenerator: {
        generateTraceId: () =>
          toHex(crypto.getRandomValues(new Uint8Array(16))),
        generateSpanId: () => toHex(crypto.getRandomValues(new Uint8Array(8))),
      },
    });

    tracerProvider.register({
      propagator: new SentryPropagator(),
      contextManager: new Sentry.SentryContextManager(),
    });
    Sentry.validateOpenTelemetrySetup();
  }

  registerTelemetry(new OpenTelemetry({ runtimeContext: true }));
}

export const onRequestError = Sentry.captureRequestError;
