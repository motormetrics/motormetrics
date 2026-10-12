import { cn } from "@heroui/react";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { percentageChange } from "@web/utils/change-ratio";
import { formatMonthShortLabel } from "@web/utils/dates/format-month";

const ROW = "flex items-center gap-2 md:gap-3";

/** Cell widths shared by the header and every row, so the columns line up. */
const CELL = {
  all: "w-12 shrink-0 text-right md:w-16",
  change: "w-14 shrink-0 text-right md:w-24",
  count: "w-12 shrink-0 text-right md:w-20",
  month: "min-w-0 flex-1",
  share: "w-12 shrink-0 text-right md:w-16",
} as const;

/**
 * The vehicle type against the whole market, newest month first, as five
 * figures a row. Phones keep every column under shorter headings. The
 * selected month is tinted and marked on its leading edge.
 */
export function MonthTable({
  rows,
  selectedMonth,
  vehicleType,
}: {
  /** Newest first. */
  rows: { count: number; month: string; total: number }[];
  selectedMonth: string;
  vehicleType: string;
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
        <span className={cn(CELL.count, "truncate")}>{vehicleType}</span>
        <span className={CELL.all}>
          <span className="max-md:hidden">All cars</span>
          <span className="md:hidden">All</span>
        </span>
        <span className={CELL.share}>Share</span>
        <span className={CELL.change}>
          <span className="max-md:hidden">vs last month</span>
          <span className="md:hidden">vs prev</span>
        </span>
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
                  ? "border-l-2 border-l-accent-strong bg-accent-soft pl-2"
                  : "hover:bg-surface-secondary",
              )}
              key={month}
            >
              <span
                className={cn(
                  CELL.month,
                  "truncate font-medium text-sm",
                  isSelected && "font-semibold text-accent-strong",
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
              <span
                className={cn(
                  CELL.share,
                  "text-muted-strong text-sm tabular-nums",
                )}
              >
                {share.toFixed(1)}%
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
