import { BonesCaptureRuntime as BonesCaptureDevRuntime } from "@web/components/shared/bones-capture-runtime.client";

/**
 * Registers Boneyard's Playwright snapshot hook during `next dev`.
 * Production builds compile this to a no-op and never load `boneyard-js`.
 */
export function BonesCaptureRuntime() {
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return <BonesCaptureDevRuntime />;
}
