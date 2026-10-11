"use client";

import { Button } from "@heroui/react";
import { SourceNote } from "@web/components/shared/overview";
import { type ReactNode, useState } from "react";

/**
 * A ruled list cut to its first rows, with a button to show the rest. The
 * rows render on the server; only which of them show is client state.
 */
export function ShowMoreRows({
  children,
  header,
  initial,
  lessLabel,
  moreLabel,
  noun,
  rows,
}: {
  /** A note after the count, e.g. which columns phones drop. */
  children?: ReactNode;
  /** The column header above the rows. */
  header: ReactNode;
  initial: number;
  /** "Show 12 exercises". */
  lessLabel: string;
  /** "Show all 26 exercises". */
  moreLabel: string;
  /** "exercises", for "Showing 12 of 26 exercises." */
  noun: string;
  rows: ReactNode[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shown = isExpanded ? rows : rows.slice(0, initial);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col">
        {header}
        <ol className="flex flex-col">{shown}</ol>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {rows.length > initial ? (
          <Button
            onPress={() => setIsExpanded((expanded) => !expanded)}
            size="sm"
            variant="outline"
          >
            {isExpanded ? lessLabel : moreLabel}
          </Button>
        ) : null}
        <SourceNote>
          Showing {shown.length} of {rows.length} {noun}. {children}
        </SourceNote>
      </div>
    </div>
  );
}
