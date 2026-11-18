import { cn } from "@heroui/react";
import type { ReactNode } from "react";

/** Column widths shared by the header and every row, so the columns line up. */
const CELL = {
  label: "flex min-w-0 flex-1 items-center gap-2 md:w-52 md:flex-none",
  bar: "block h-2 min-w-0 flex-1 max-md:hidden",
  value: "w-16 shrink-0 text-right",
  trailing: "w-20 shrink-0 text-right",
} as const;

/** The column heads over a list of `BarRow`s. */
export function BarHeader({
  label,
  trailing,
  value,
}: {
  label: string;
  /** The last column's head; left out when the rows have no last column. */
  trailing?: ReactNode;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 border-separator border-b pb-2 font-semibold text-muted text-xs">
      <span className={CELL.label}>{label}</span>
      <span aria-hidden className={CELL.bar} />
      <span className={CELL.value}>{value}</span>
      {trailing === undefined ? null : (
        <span className={CELL.trailing}>{trailing}</span>
      )}
    </div>
  );
}

/**
 * One ruled row of a ranked list: the name, a bar drawn against the list's
 * largest figure, the figure, and an optional last column for a share or a
 * change. The bar drops out on a phone, where the figures carry the row.
 */
export function BarRow({
  label,
  percent,
  trailing,
  value,
}: {
  label: ReactNode;
  /** The bar's length, as a percentage of the list's largest figure. */
  percent: number;
  trailing?: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 border-separator border-b py-2 text-sm">
      <span className={CELL.label}>{label}</span>
      <span className={CELL.bar}>
        <span
          className="block h-full rounded-full bg-accent"
          // The length is data, so it cannot be a predefined utility.
          style={{ width: `${Math.max(percent, 0.5).toFixed(1)}%` }}
        />
      </span>
      <span className={cn(CELL.value, "font-semibold tabular-nums")}>
        {value}
      </span>
      {trailing === undefined ? null : (
        <span className={cn(CELL.trailing, "text-muted tabular-nums")}>
          {trailing}
        </span>
      )}
    </div>
  );
}
