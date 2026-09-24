import { FEATURE_FLAG_UNRELEASED } from "@web/config";
import type { ReactNode } from "react";

export function UnreleasedFeature({ children }: { children: ReactNode }) {
  return FEATURE_FLAG_UNRELEASED ? children : null;
}
