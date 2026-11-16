import { Chip, cn, Typography } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Direction D's "range" hero under the page title: a ruled column with the
 * label line on top, then whatever the page places under it — usually a
 * `RangeFigure`, a `RangeBar` and a muted context line. Sized as a KPI rather
 * than a giant headline number.
 *
 * Holds no state, so it renders from server and client components alike, and
 * a page can stream its figures in a Suspense boundary inside it.
 */
export function RangeHero({
  children,
  label,
}: {
  children: ReactNode;
  /** The bold subject and its period: "**Vehicles deregistered** · August 2026". */
  label: ReactNode;
}) {
  return (
    <div className="flex max-w-xl flex-col gap-2.5 border-separator border-t pt-4">
      <Typography.Paragraph color="muted" size="sm">
        {label}
      </Typography.Paragraph>
      {children}
    </div>
  );
}

/** The range hero's figure with its change as a neutral pill. */
export function RangeFigure({
  change,
  size = "md",
  value,
}: {
  /** Colour does not carry the direction; the sign does. */
  change?: string;
  /** `lg` steps the figure up a size on large screens, as the COE overview does. */
  size?: "md" | "lg";
  value: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
      <span
        className={cn(
          "font-extrabold text-4xl tabular-nums leading-none tracking-tight",
          size === "lg" && "lg:text-5xl",
        )}
      >
        {value}
      </span>
      {change ? (
        <Chip className="tabular-nums" color="accent" variant="soft">
          {change}
        </Chip>
      ) : null}
    </div>
  );
}
