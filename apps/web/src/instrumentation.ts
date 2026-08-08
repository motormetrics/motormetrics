import { OpenTelemetry } from "@ai-sdk/otel";
import { LangfuseSpanProcessor } from "@langfuse/otel";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { registerTelemetry } from "ai";

const toHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((base) => base.toString(16).padStart(2, "0"))
    .join("");

export async function register() {
  const langfuseSpanProcessor = new LangfuseSpanProcessor({
    shouldExportSpan: ({ otelSpan }) =>
      ["langfuse-sdk", "ai"].includes(otelSpan.instrumentationScope.name),
    // Export spans immediately in serverless environments (no batching)
    exportMode: "immediate",
  });

  const tracerProvider = new NodeTracerProvider({
    spanProcessors: [langfuseSpanProcessor],
    // Use Web Crypto API to avoid Math.random() which triggers
    // Next.js prerender bailout in Server Components.
    idGenerator: {
      generateTraceId: () => toHex(crypto.getRandomValues(new Uint8Array(16))),
      generateSpanId: () => toHex(crypto.getRandomValues(new Uint8Array(8))),
    },
  });

  tracerProvider.register();
  registerTelemetry(new OpenTelemetry({ runtimeContext: true }));
}
