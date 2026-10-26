"use client";

import { Button, Disclosure } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * A closed-by-default section holding a table the page does not need up
 * front: the full breakdown of "Other", the month-by-month figures. Closed
 * keeps the page to its answer; the table stays in the markup for search
 * engines and expands in place for readers who want it.
 *
 * A client wrapper because HeroUI's compound members only run on the client;
 * the server-rendered table passes through as `children`.
 */
export function TableDisclosure({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <Disclosure>
      <Disclosure.Heading>
        <Button
          className="w-full justify-between"
          size="lg"
          slot="trigger"
          variant="ghost"
        >
          {title}
          <Disclosure.Indicator />
        </Button>
      </Disclosure.Heading>
      <Disclosure.Content>
        <Disclosure.Body className="flex flex-col gap-3 pt-2">
          {children}
        </Disclosure.Body>
      </Disclosure.Content>
    </Disclosure>
  );
}
