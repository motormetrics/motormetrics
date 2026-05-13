"use client";

import { Button, Disclosure } from "@heroui/react";

import type { ReactNode } from "react";

interface PqpSecondaryDisclosureProps {
  children: ReactNode;
}

export function PqpSecondaryDisclosure({
  children,
}: PqpSecondaryDisclosureProps) {
  return (
    <Disclosure>
      {({ isExpanded }) => (
        <div className="flex flex-col gap-4">
          <Disclosure.Heading>
            <Button
              className="h-auto w-full justify-between px-5 py-4 text-left"
              slot="trigger"
              variant="secondary"
            >
              <span className="flex flex-col gap-1">
                <span>
                  {isExpanded
                    ? "Hide commercial and motorcycle analysis"
                    : "Show commercial and motorcycle analysis"}
                </span>
                <span className="font-normal text-muted text-xs">
                  Goods vehicles, buses, and motorcycles are shown separately
                  from the passenger-car renewal view.
                </span>
              </span>
              <Disclosure.Indicator className="shrink-0 text-muted" />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className="flex flex-col gap-8">
              {children}
            </Disclosure.Body>
          </Disclosure.Content>
        </div>
      )}
    </Disclosure>
  );
}
