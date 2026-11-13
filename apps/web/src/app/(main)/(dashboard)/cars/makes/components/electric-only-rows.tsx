"use client";

import { Button } from "@heroui/react";
import { SourceNote } from "@web/components/shared/overview";
import { type ReactNode, useState } from "react";

/** Rows shown before the reader asks for the rest. */
const COLLAPSED_ROWS = 8;

/**
 * The electric-only list cut to its first eight makes, with a button to show
 * the rest. The rows render on the server; only how many show is client
 * state.
 */
export function ElectricOnlyRows({
  header,
  note,
  rows,
}: {
  header: ReactNode;
  note: ReactNode;
  rows: ReactNode[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <div className="flex flex-col">
        {header}
        {isExpanded ? rows : rows.slice(0, COLLAPSED_ROWS)}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {rows.length > COLLAPSED_ROWS ? (
          <Button
            aria-expanded={isExpanded}
            onPress={() => setIsExpanded((current) => !current)}
            size="sm"
            variant="outline"
          >
            {isExpanded
              ? `Show top ${COLLAPSED_ROWS} only`
              : `Show all ${rows.length} makes`}
          </Button>
        ) : null}
        <SourceNote>{note}</SourceNote>
      </div>
    </>
  );
}
