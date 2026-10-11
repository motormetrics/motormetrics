import { DeltaChip } from "@web/components/shared/delta-chip";

export interface VehicleMixRow {
  /** Chart-colour custom property, shared with the trend and the table. */
  color: string;
  count: number;
  /** Display name, e.g. "SUV" rather than LTA's "Sports Utility Vehicle". */
  label: string;
  /** Percentage of the period's registrations. */
  share: number;
}

const formatCount = (value: number): string => value.toLocaleString("en-SG");

/**
 * The headline vehicle type's share of the period beside the whole mix: one
 * stacked share bar, then a ruled row per vehicle type, as the Hybrid comp
 * draws it.
 */
export function VehicleTypesHeadline({
  change,
  changeLabel,
  featured,
  mix,
  periodLabel,
  periodSpan,
  total,
}: {
  /** Movement in the featured share, in percentage points. */
  change: number;
  /** "2025", the year the change is measured against. */
  changeLabel: string;
  featured: VehicleMixRow;
  /** Largest first. */
  mix: VehicleMixRow[];
  /** "August 2026" or "2026 year to date". */
  periodLabel: string;
  /** The period in running text: "August 2026" or "January to August 2026". */
  periodSpan: string;
  total: number;
}) {
  return (
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <span className="font-semibold text-muted text-xs">
          {featured.label} share of registrations
        </span>
        <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
          {featured.share.toFixed(1)}%
        </span>
        <span className="text-muted-strong tabular-nums">
          <DeltaChip
            className="font-semibold text-foreground"
            unit="pp"
            value={change}
          />{" "}
          against the same period in {changeLabel}
        </span>
        <span className="text-muted text-sm tabular-nums">
          {formatCount(featured.count)} of {formatCount(total)} cars ·{" "}
          {periodLabel}
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <span className="font-semibold text-muted text-xs">
          Mix by vehicle type · {periodLabel}
        </span>
        <div
          aria-label={mix
            .map(({ label, share }) => `${label} ${share.toFixed(1)}%`)
            .join(", ")}
          className="flex h-4 gap-0.5"
          role="img"
        >
          {mix.map(({ color, label, share }) => (
            <span
              className="block h-full"
              key={label}
              style={{ background: color, width: `${share}%` }}
            />
          ))}
        </div>
        <ul className="flex flex-col">
          <li
            aria-hidden
            className="flex items-center gap-2.5 border-border border-b pb-2 font-semibold text-muted text-xs"
          >
            <span className="w-3 shrink-0" />
            <span className="min-w-0 flex-1">Vehicle type</span>
            <span className="w-20 shrink-0 text-right">Cars</span>
            <span className="w-16 shrink-0 text-right">Share</span>
          </li>
          {mix.map(({ color, count, label, share }) => (
            <li
              className="flex items-center gap-2.5 border-separator border-b py-2 text-sm tabular-nums"
              key={label}
            >
              <span
                aria-hidden
                className="block size-3 shrink-0 rounded-xs"
                style={{ background: color }}
              />
              <span className="min-w-0 flex-1 truncate">{label}</span>
              <span className="w-20 shrink-0 text-right">
                {formatCount(count)}
                <span className="sr-only"> cars</span>
              </span>
              <span className="w-16 shrink-0 text-right font-semibold">
                {share.toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
        <span className="text-subtle text-xs">
          Share of {formatCount(total)} new cars, {periodSpan}.
        </span>
      </div>
    </div>
  );
}
