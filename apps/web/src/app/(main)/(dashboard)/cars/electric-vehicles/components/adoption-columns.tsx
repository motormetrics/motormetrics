"use client";

import { cn } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { parseAsString, useQueryState } from "nuqs";

export interface AdoptionColumn {
  month: string;
  /** Battery-electric share of the month's registrations, 0-100. */
  share: number;
}

/**
 * Column chart of EV share by month. Selecting a column moves the whole page to
 * that month, which is why this is a client island — the columns themselves are
 * computed on the server and arrive as props.
 */
export function AdoptionColumns({
  columns,
  selectedMonth,
}: {
  columns: AdoptionColumn[];
  selectedMonth: string;
}) {
  const [, setMonth] = useQueryState(
    "month",
    parseAsString.withDefault(selectedMonth).withOptions({ shallow: false }),
  );

  const tallest = columns.reduce(
    (max, column) => Math.max(max, column.share),
    0,
  );

  return (
    <div className="flex items-end gap-2.5">
      {columns.map((column) => {
        const isSelected = column.month === selectedMonth;
        const label = formatDateToMonthYear(column.month);

        return (
          <button
            aria-label={`Show ${label}`}
            aria-pressed={isSelected}
            className="grid h-[150px] flex-1 cursor-pointer grid-rows-[auto_1fr_auto] gap-2"
            key={column.month}
            onClick={() => setMonth(column.month)}
            type="button"
          >
            <span
              className={cn(
                "text-center font-bold text-xs tabular-nums",
                isSelected ? "text-chart-1" : "text-muted",
              )}
            >
              {column.share.toFixed(0)}%
            </span>
            <span className="flex items-end">
              <span
                className="w-full rounded-[10px]"
                data-column-bar
                style={{
                  background: isSelected
                    ? "var(--chart-1)"
                    : "color-mix(in oklab, var(--accent) 15%, transparent)",
                  height: `${tallest > 0 ? (column.share / tallest) * 100 : 0}%`,
                }}
              />
            </span>
            <span
              className={cn(
                "text-center text-xs",
                isSelected
                  ? "font-extrabold text-chart-1"
                  : "font-semibold text-muted",
              )}
            >
              {label.slice(0, 3)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
