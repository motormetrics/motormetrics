import { Chip } from "@heroui/react";
import type { PropsWithChildren } from "react";

interface ComingSoonProps extends PropsWithChildren {}

export function ComingSoon({ children }: ComingSoonProps) {
  return (
    <div className="pointer-events-none relative inline-block rounded-sm">
      {children}
      <Chip
        color="accent"
        variant="primary"
        size="sm"
        className="absolute top-0 left-0 translate-x-1/2 -translate-y-1/2 rotate-3 transform text-nowrap"
      >
        Coming Soon
      </Chip>
    </div>
  );
}
