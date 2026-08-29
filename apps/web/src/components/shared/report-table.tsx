import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import type { ReactNode } from "react";

/**
 * The bare, rule-ruled table the report comps use. No card, no surface — the
 * hairlines carry the structure, so this is a plain semantic table with the
 * comp's type scale applied.
 *
 * Columns differ per table — one carries year-to-date, another a rank and a
 * logo — so rows are composed by the caller and only the shared furniture lives
 * here.
 */
export function ReportTable({
  children,
  columns,
}: {
  children: ReactNode;
  columns: { align?: "end"; label: string; width?: string }[];
}) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse tabular-nums">
        <thead>
          <tr>
            {columns.map(({ align, label, width }) => (
              <th
                className={cn(
                  "border-border border-b px-3.5 pb-3 font-bold text-muted text-xs uppercase tracking-wider",
                  align === "end" ? "text-right" : "text-left",
                )}
                key={label || width}
                scope="col"
                style={width ? { width } : undefined}
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

/** A row. `isActive` tints the row the way the comp marks the selected fuel type. */
export function ReportRow({
  children,
  isActive,
}: {
  children: ReactNode;
  isActive?: boolean;
}) {
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-surface-secondary",
        isActive && "bg-accent-soft-2",
      )}
    >
      {children}
    </tr>
  );
}

export function ReportCell({
  align,
  children,
  className,
}: {
  align?: "end";
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={cn(
        "border-border border-b px-3.5 py-4",
        align === "end" && "text-right",
        className,
      )}
    >
      {children}
    </td>
  );
}

/** The inline proportion bar the comps run in an unlabelled column. */
export function ShareBar({
  isLeader,
  share,
}: {
  isLeader?: boolean;
  share: number;
}) {
  return (
    <span className="block h-2.5 overflow-hidden rounded-full bg-surface-secondary">
      <span
        className={cn(
          "block h-full rounded-full",
          isLeader ? "bg-chart-1" : "bg-chart-5",
        )}
        style={{ width: `${Math.min(share, 100).toFixed(1)}%` }}
      />
    </span>
  );
}

/**
 * Signed change as plain coloured text rather than a pill — the comps reserve
 * the pill for the headline figure and use bare text inside tables.
 *
 * A rise in registrations is good news, so the sentiment follows the sign. For
 * figures where a rise is bad news, see `(dashboard)/components/cost-trend-chip.tsx`.
 */
export function DeltaText({
  unit = "%",
  value,
}: {
  unit?: "%" | "pp";
  value: number;
}) {
  const isUp = value >= 0;

  return (
    <span
      className={cn(
        "font-bold text-base tabular-nums",
        isUp ? "text-success-soft-foreground" : "text-warning-soft-foreground",
      )}
    >
      {isUp ? "+" : "−"}
      {Math.abs(value).toFixed(1)}
      {unit}
    </span>
  );
}

/** Registration counts, formatted the way every other figure on the site is. */
export function Count({ value }: { value: number }) {
  return <NumberValue locale="en-SG" maximumFractionDigits={0} value={value} />;
}
