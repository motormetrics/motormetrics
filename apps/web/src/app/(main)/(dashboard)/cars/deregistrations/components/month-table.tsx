import { cn } from "@heroui/react";
import { formatMonthShortLabel } from "@web/utils/dates/format-month";

/**
 * The category columns in the order the counts arrive, with the breakpoint
 * each drops out at: the comp keeps Categories A and B on a phone, adds C and
 * D from `md`, and the two minor columns from `lg`.
 */
const COLUMNS = [
  { hidden: "", label: "Cat A" },
  { hidden: "", label: "Cat B" },
  { hidden: "max-md:hidden", label: "Cat C" },
  { hidden: "max-md:hidden", label: "Cat D" },
  { hidden: "max-lg:hidden", label: "Taxis" },
  { hidden: "max-lg:hidden", label: "Exempt" },
];

const ROW = "flex items-center gap-3 px-2 max-md:gap-2 max-md:px-0.5";
const MONTH_CELL = "w-28 shrink-0 max-md:w-20";
const COUNT_CELL = "min-w-0 flex-1 text-right tabular-nums";

/**
 * Twelve months, newest first, with the total and each category's count. The
 * selected month is tinted and marked on its leading edge.
 */
export function MonthTable({
  rows,
  selectedMonth,
}: {
  /** Newest first; `counts` follows the column order above. */
  rows: { counts: number[]; month: string; total: number }[];
  selectedMonth: string;
}) {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          ROW,
          "border-border border-b pb-2 font-semibold text-muted text-xs",
        )}
      >
        <span className={MONTH_CELL}>Month</span>
        <span className={COUNT_CELL}>Total</span>
        {COLUMNS.map(({ hidden, label }) => (
          <span className={cn(COUNT_CELL, hidden)} key={label}>
            {label}
          </span>
        ))}
      </div>
      <ul className="flex flex-col">
        {rows.map((row) => {
          const isSelected = row.month === selectedMonth;

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
              key={row.month}
            >
              <span
                className={cn(
                  MONTH_CELL,
                  "whitespace-nowrap text-sm",
                  isSelected ? "font-bold text-accent-strong" : "font-medium",
                )}
              >
                {formatMonthShortLabel(row.month)}
              </span>
              <span className={cn(COUNT_CELL, "font-semibold text-sm")}>
                {row.total.toLocaleString("en-SG")}
              </span>
              {row.counts.map((count, index) => (
                <span
                  className={cn(
                    COUNT_CELL,
                    "text-muted-strong text-sm",
                    COLUMNS[index]?.hidden,
                  )}
                  key={COLUMNS[index]?.label ?? index}
                >
                  {count.toLocaleString("en-SG")}
                </span>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
