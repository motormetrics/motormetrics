import { cn, ProgressBar } from "@heroui/react";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import type { CSSProperties } from "react";

const HEADER = "border-border border-b pb-2 font-semibold text-muted text-xs";
const formatCount = (value: number): string => value.toLocaleString("en-SG");

/**
 * The bar against the largest row, then the share as a percentage. The bar
 * drops out on phones and the percentage keeps the cell.
 */
function ShareCell({
  barLabel,
  className,
  isLeader,
  scaled,
  share,
}: {
  /** Accessible name for the bar. */
  barLabel: string;
  className: string;
  isLeader: boolean;
  /** Percentage of the largest row, which fills the track. */
  scaled: number;
  /** Percentage of the whole, printed beside the bar. */
  share: number;
}) {
  return (
    <span className={cn("flex items-center justify-end gap-2.5", className)}>
      <ProgressBar
        aria-label={barLabel}
        className="min-w-0 flex-1 max-md:hidden"
        style={
          {
            "--progress-bar-fill": isLeader
              ? "var(--chart-1)"
              : "var(--chart-3)",
          } as CSSProperties
        }
        value={scaled}
      >
        <ProgressBar.Track>
          <ProgressBar.Fill />
        </ProgressBar.Track>
      </ProgressBar>
      <span className="w-12 shrink-0 text-right text-muted-strong text-sm tabular-nums">
        {share.toFixed(1)}%
      </span>
    </span>
  );
}

const MAKE_ROW = "flex items-center gap-3 max-md:gap-2.5";
const RANK_CELL = "w-5 shrink-0";
const MAKE_CELL = "flex min-w-0 flex-1 items-center gap-2.5";
const MAKE_CARS_CELL = "w-16 shrink-0 text-right max-md:w-14";
const MAKE_SHARE_CELL = "w-36 shrink-0 max-md:w-12";

/** The year's leading makes, ranked, with logos and their share of the year. */
export function TopMakesTable({
  makes,
  total,
}: {
  makes: { logoUrl: string | null; make: string; value: number }[];
  /** Every new car registered in the year, which the shares are of. */
  total: number;
}) {
  const leader = Math.max(1, ...makes.map((item) => item.value));

  return (
    <div className="flex flex-col">
      <div className={cn(MAKE_ROW, HEADER)}>
        <span className={RANK_CELL}>#</span>
        <span className={MAKE_CELL}>Make</span>
        <span className={MAKE_CARS_CELL}>Cars</span>
        <span className={cn(MAKE_SHARE_CELL, "text-right")}>Share</span>
      </div>
      <ol className="flex flex-col">
        {makes.map((item, index) => (
          <li
            className={cn(MAKE_ROW, "border-separator border-b py-2")}
            key={item.make}
          >
            {/* The comp picks out the podium: the top three ranks in accent. */}
            <span
              className={cn(
                RANK_CELL,
                "text-sm tabular-nums",
                index < 3 ? "font-semibold text-accent-strong" : "text-muted",
              )}
            >
              {index + 1}
            </span>
            <span className={MAKE_CELL}>
              <MakeAvatar logoUrl={item.logoUrl} make={item.make} size="sm" />
              <span className="truncate font-medium text-sm">{item.make}</span>
            </span>
            <span
              className={cn(
                MAKE_CARS_CELL,
                "font-semibold text-sm tabular-nums",
              )}
            >
              {formatCount(item.value)}
            </span>
            <ShareCell
              barLabel={`${item.make} against the leader`}
              className={MAKE_SHARE_CELL}
              isLeader={index === 0}
              scaled={(item.value / leader) * 100}
              share={(item.value / (total || 1)) * 100}
            />
          </li>
        ))}
      </ol>
    </div>
  );
}

const TYPE_ROW = "flex items-center gap-3 max-md:gap-2.5";
const TYPE_CELL = "min-w-0 flex-1 truncate";
const TYPE_CARS_CELL = "w-16 shrink-0 text-right max-md:w-14";
const TYPE_SHARE_CELL = "w-32 shrink-0 max-md:w-12";
const TYPE_CHANGE_CELL = "w-20 shrink-0 text-right max-md:w-16";

/** The month's registrations by body type, against the same month a year on. */
export function VehicleTypeTable({
  previousYear,
  rows,
  total,
}: {
  previousYear: number;
  rows: { change: number; count: number; name: string }[];
  /** The month's registrations, which the shares are of. */
  total: number;
}) {
  const largest = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div className="flex flex-col">
      <div className={cn(TYPE_ROW, HEADER)}>
        <span className={TYPE_CELL}>Type</span>
        <span className={TYPE_CARS_CELL}>Cars</span>
        <span className={cn(TYPE_SHARE_CELL, "text-right")}>Share</span>
        <span className={TYPE_CHANGE_CELL}>vs {previousYear}</span>
      </div>
      {rows.map((row, index) => (
        <div
          className={cn(TYPE_ROW, "border-separator border-b py-2.5")}
          key={row.name}
        >
          <span className={cn(TYPE_CELL, "text-sm")}>{row.name}</span>
          <span
            className={cn(TYPE_CARS_CELL, "font-semibold text-sm tabular-nums")}
          >
            {formatCount(row.count)}
          </span>
          <ShareCell
            barLabel={`${row.name} against the largest type`}
            className={TYPE_SHARE_CELL}
            isLeader={index === 0}
            scaled={(row.count / largest) * 100}
            share={(row.count / (total || 1)) * 100}
          />
          <DeltaChip
            className={cn(TYPE_CHANGE_CELL, "text-sm")}
            value={row.change}
          />
        </div>
      ))}
    </div>
  );
}
