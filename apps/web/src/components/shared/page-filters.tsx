"use client";

import { Button, Sheet, Typography } from "@heroui/react";
import { ListFilter } from "lucide-react";
import type { ReactNode } from "react";

/** One labelled filter: the label above its control. */
export function FilterGroup({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <Typography.Paragraph color="muted" size="xs" weight="semibold">
        {label}
      </Typography.Paragraph>
      {children}
    </div>
  );
}

/**
 * The page's filters as a tinted panel at the top of the right sidebar. Shown
 * once the sidebar sits beside the sections; before then `FiltersSheet` in
 * the page head carries the same controls.
 */
export function FiltersPanel({ children }: { children: ReactNode }) {
  return (
    <section
      aria-label="Filters"
      className="flex flex-col gap-4 rounded-2xl bg-surface-secondary p-5 max-xl:hidden"
    >
      <Typography.Heading className="text-base" level={2}>
        Filters
      </Typography.Heading>
      {children}
    </section>
  );
}

/**
 * The "Filters" button for the page head on narrower screens, opening the
 * same controls in a full-height sheet. Each control keeps its URL parameter,
 * so the two copies never disagree.
 */
export function FiltersSheet({ children }: { children: ReactNode }) {
  return (
    <Sheet placement="right">
      <Sheet.Trigger>
        <Button className="xl:hidden" variant="outline">
          <ListFilter aria-hidden="true" className="size-4" />
          Filters
        </Button>
      </Sheet.Trigger>
      <Sheet.Backdrop>
        <Sheet.Content className="w-full max-w-sm">
          <Sheet.Dialog>
            <Sheet.CloseTrigger />
            <Sheet.Header>
              <Sheet.Heading>Filters</Sheet.Heading>
            </Sheet.Header>
            <Sheet.Body className="flex flex-col gap-5">{children}</Sheet.Body>
            <Sheet.Footer>
              <Sheet.Close>
                <Button variant="primary">Done</Button>
              </Sheet.Close>
            </Sheet.Footer>
          </Sheet.Dialog>
        </Sheet.Content>
      </Sheet.Backdrop>
    </Sheet>
  );
}
