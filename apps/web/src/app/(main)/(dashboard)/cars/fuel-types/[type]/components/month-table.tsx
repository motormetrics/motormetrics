import { cn } from "@heroui/react";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { percentageChange } from "@web/utils/change-ratio";
import { formatMonthShortLabel } from "@web/utils/dates/format-month";

const ROW = "flex items-center gap-2 px-0.5 md:gap-4 md:px-2";

/** Cell widths shared by the header and every row, so the columns line up. */
const CELL = {
  all: "w-24 shrink-0 text-right max-md:hidden",
  change: "w-16 shrink-0 text-right md:w-28",
  count: "w-14 shrink-0 text-right md:w-24",
  month: "w-20 shrink-0 md:w-24",
  share: "flex min-w-0 flex-1 items-center justify-end gap-2.5",
} as const;

/**
 * The fuel type against the whole market, newest month first. The share bar
 * runs from 0 to 100% of the month's new cars; phones drop the bar and the
 * all-cars column. The selected month is tinted and marked on its leading
 * edge.
 */
export function MonthTable({
  fuelType,
  rows,
  selectedMonth,
}: {
  fuelType: string;
  /** Newest first. */
  rows: { count: number; month: string; total: number }[];
  selectedMonth: string;
}) {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          ROW,
          "items-end border-border border-b pb-2 font-semibold text-muted text-xs",
        )}
      >
        <span className={CELL.month}>Month</span>
        <span className={cn(CELL.count, "truncate")}>{fuelType}</span>
        <span className={CELL.all}>All cars</span>
        <span className={CELL.share}>Share</span>
        <span className={CELL.change}>vs last month</span>
      </div>
      <ul className="flex flex-col">
        {rows.map(({ count, month, total }, index) => {
          const isSelected = month === selectedMonth;
          const share = total > 0 ? (count / total) * 100 : 0;
          // Newest first, so the month before this one is the next row along.
          const previousCount = rows[index + 1]?.count;

          return (
            <li
              aria-current={isSelected ? "date" : undefined}
              className={cn(
                ROW,
                "border-separator border-b py-2.5",
                isSelected
                  ? "border-l-2 border-l-accent-strong bg-accent-soft"
                  : "hover:bg-surface-secondary",
              )}
              key={month}
            >
              <span
                className={cn(
                  CELL.month,
                  "whitespace-nowrap font-semibold text-sm",
                  isSelected && "text-accent-strong",
                )}
              >
                {formatMonthShortLabel(month)}
              </span>
              <span
                className={cn(CELL.count, "font-semibold text-sm tabular-nums")}
              >
                {count.toLocaleString("en-SG")}
              </span>
              <span
                className={cn(
                  CELL.all,
                  "text-muted-strong text-sm tabular-nums",
                )}
              >
                {total.toLocaleString("en-SG")}
              </span>
              <span className={CELL.share}>
                <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary max-md:hidden">
                  <span
                    className="block h-full rounded-r-xs"
                    style={{
                      background: isSelected
                        ? "var(--chart-1)"
                        : "var(--chart-3)",
                      width: `${share.toFixed(1)}%`,
                    }}
                  />
                </span>
                <span className="w-12 shrink-0 text-right text-muted-strong text-sm tabular-nums">
                  {share.toFixed(1)}%
                </span>
              </span>
              {previousCount === undefined ? (
                <span className={cn(CELL.change, "text-muted text-sm")}>—</span>
              ) : (
                <DeltaChip
                  className={cn(CELL.change, "text-sm")}
                  value={percentageChange(count, previousCount)}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
