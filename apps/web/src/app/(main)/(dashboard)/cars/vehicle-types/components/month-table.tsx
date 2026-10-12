import { cn } from "@heroui/react";
import { formatMonthShortLabel } from "@web/utils/dates/format-month";

/** The comp's column headings, keyed by LTA's value; others keep their own name. */
const HEADINGS: Record<string, string> = {
  "Coupe/Convertible": "Coupe",
  "Multi-purpose Vehicle": "MPV",
  "Sports Utility Vehicle": "SUV",
  "Station-wagon": "Wagon",
};

/** The comp's phone headings, where a full one would not fit. */
const SHORT_HEADINGS: Record<string, string> = {
  Hatchback: "Hatch",
};

/** How many type columns phones keep; the smaller types drop out after it. */
export const PHONE_COLUMNS = 4;

const ROW = "flex items-center gap-3 px-2 max-md:gap-1.5 max-md:px-0.5";
const MONTH_CELL = "w-24 shrink-0 max-md:w-16";
const TOTAL_CELL = "w-20 shrink-0 text-right tabular-nums max-md:hidden";
const SHARE_CELL = "min-w-0 flex-1 text-right tabular-nums";

/** Hides the columns past the phone limit below `md`. */
const phoneHidden = (index: number) =>
  index >= PHONE_COLUMNS ? "max-md:hidden" : undefined;

/**
 * Twelve months, newest first, with each charted vehicle type's share of the
 * month and its count. Narrower screens drop the counts; phones also drop the
 * total and the two smallest types, and shorten the headings. The selected
 * month is tinted and marked on its leading edge.
 */
export function MonthTable({
  rows,
  selectedMonth,
  vehicleTypes,
}: {
  /** Newest first. */
  rows: {
    cells: { count: number; share: number }[];
    month: string;
    total: number;
  }[];
  selectedMonth: string;
  /** Column order as LTA records each type, matching `cells` in each row. */
  vehicleTypes: string[];
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
        {vehicleTypes.map((name, index) => {
          const heading = HEADINGS[name] ?? name;
          return (
            <span
              className={cn(SHARE_CELL, "truncate", phoneHidden(index))}
              key={name}
            >
              <span className="max-md:hidden">{heading}</span>
              <span className="md:hidden">
                {SHORT_HEADINGS[name] ?? heading}
              </span>
            </span>
          );
        })}
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
                  className={cn(
                    SHARE_CELL,
                    "flex flex-col items-end",
                    phoneHidden(index),
                  )}
                  key={vehicleTypes[index] ?? index}
                >
                  <span className="font-semibold text-sm">
                    {share.toFixed(1)}%
                  </span>
                  <span className="text-subtle text-xs max-xl:hidden">
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
