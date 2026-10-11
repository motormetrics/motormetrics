import { cn } from "@heroui/react";
import { formatMonthShortLabel } from "@web/utils/dates/format-month";

/** The comp's phone headings; a fuel type outside it keeps its own name. */
const SHORT_LABELS: Record<string, string> = {
  "Petrol-Electric": "Petrol-elec.",
  "Petrol-Electric (Plug-In)": "Plug-in",
};

const ROW = "flex items-center gap-3 px-2 max-md:gap-1.5 max-md:px-0.5";
const MONTH_CELL = "w-24 shrink-0 max-md:w-16";
const TOTAL_CELL = "w-20 shrink-0 text-right tabular-nums max-md:hidden";
const SHARE_CELL = "min-w-0 flex-1 text-right tabular-nums";

/**
 * Twelve months, newest first, with each charted fuel type's share of the
 * month and its count. Phones drop the total and the counts, and shorten the
 * headings. The selected month is tinted and marked on its leading edge.
 */
export function MonthTable({
  fuelTypes,
  rows,
  selectedMonth,
}: {
  /** Column order, matching `cells` in each row. */
  fuelTypes: string[];
  /** Newest first. */
  rows: {
    cells: { count: number; share: number }[];
    month: string;
    total: number;
  }[];
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
        <span className={MONTH_CELL}>Month</span>
        <span className={TOTAL_CELL}>Total</span>
        {fuelTypes.map((name) => (
          <span className={SHARE_CELL} key={name}>
            <span className="max-md:hidden">{name}</span>
            <span className="md:hidden">{SHORT_LABELS[name] ?? name}</span>
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
                  isSelected ? "font-bold text-accent-strong" : "font-semibold",
                )}
              >
                {formatMonthShortLabel(row.month)}
              </span>
              <span className={cn(TOTAL_CELL, "text-muted-strong text-sm")}>
                {row.total.toLocaleString("en-SG")}
              </span>
              {row.cells.map(({ count, share }, index) => (
                <span
                  className={cn(SHARE_CELL, "whitespace-nowrap")}
                  key={fuelTypes[index] ?? index}
                >
                  <span className="font-semibold text-sm">
                    {share.toFixed(1)}%
                  </span>
                  <span className="ml-1.5 text-subtle text-xs max-md:hidden">
                    {count.toLocaleString("en-SG")}
                  </span>
                </span>
              ))}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
