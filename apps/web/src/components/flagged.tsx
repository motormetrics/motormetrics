import type { ReactNode } from "react";

export async function Flagged({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) {
    return null;
  }

  return children;
}
