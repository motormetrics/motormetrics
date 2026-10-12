import { DeltaChip } from "@web/components/shared/delta-chip";

export interface FuelMixRow {
  /** Chart-colour custom property, shared with the trend and the table. */
  color: string;
  count: number;
  name: string;
  /** Percentage of the period's registrations. */
  share: number;
}

const formatCount = (value: number): string => value.toLocaleString("en-SG");

/**
 * The headline fuel type's share of the period beside the whole mix: one
 * stacked share bar, then a ruled row per fuel type, as the Hybrid comp draws
 * it.
 */
export function FuelTypesHeadline({
  change,
  changeLabel,
  featured,
  mix,
  periodLabel,
  total,
}: {
  /** Movement in the featured share, in percentage points. */
  change: number;
  /** "2025", the period the change is measured against. */
  changeLabel: string;
  featured: FuelMixRow;
  /** Largest first. */
  mix: FuelMixRow[];
  periodLabel: string;
  total: number;
}) {
  return (
    <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <span className="font-semibold text-muted text-xs">
          {featured.name} share of registrations · {periodLabel}
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
          against {changeLabel}
        </span>
        <span className="text-muted text-sm tabular-nums">
          {formatCount(featured.count)} of {formatCount(total)} new cars
        </span>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <span className="font-semibold text-muted text-xs">
          {periodLabel} by fuel type
        </span>
        <div
          aria-label={mix
            .map(({ name, share }) => `${name} ${share.toFixed(1)}%`)
            .join(", ")}
          className="flex h-4 gap-0.5"
          role="img"
        >
          {mix.map(({ color, name, share }) => (
            <span
              className="block h-full"
              key={name}
              style={{ background: color, width: `${share}%` }}
            />
          ))}
        </div>
        <ul className="flex flex-col">
          {mix.map(({ color, count, name, share }) => (
            <li
              className="flex items-center gap-2.5 border-separator border-b py-2"
              key={name}
            >
              <span
                aria-hidden
                className="block size-3 shrink-0 rounded-xs"
                style={{ background: color }}
              />
              <span className="min-w-0 flex-1 truncate text-sm">{name}</span>
              <span className="w-16 shrink-0 text-right font-semibold text-sm tabular-nums">
                {share.toFixed(1)}%
              </span>
              <span className="w-20 shrink-0 text-right text-muted text-xs tabular-nums">
                {formatCount(count)} cars
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
