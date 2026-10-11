import { DeltaChip } from "@web/components/shared/delta-chip";

export interface CategoryRow {
  category: string;
  /** Chart-colour custom property, shared with the trend chart's legend. */
  color: string;
  count: number;
  description: string;
  /** Percentage of the month's total. */
  share: number;
  /** Percentage change on the same month a year earlier; null without one. */
  yearAgoChange: number | null;
}

/**
 * The month's categories as a ruled list, largest first, with the share drawn
 * as a bar scaled to the largest category. Flex rows of preset-width cells
 * rather than a table, so columns can drop out on narrower screens as the
 * comp does: the description below `lg`, the bar below `md`.
 */
export function CategoryTable({
  rows,
  yearAgoLabel,
}: {
  rows: CategoryRow[];
  /** "2025", heading the change column. */
  yearAgoLabel: string;
}) {
  const largest = Math.max(...rows.map(({ count }) => count));

  return (
    <div className="flex flex-col">
      <div className="flex items-end gap-4 border-border border-b px-2 pb-2 font-semibold text-muted text-xs max-md:gap-2 max-md:px-0.5">
        <span className="min-w-0 flex-1">Category</span>
        <span className="min-w-0 flex-1 max-lg:hidden">Description</span>
        <span className="w-24 text-right max-md:w-14">Vehicles</span>
        <span className="w-48 text-right max-md:w-12 max-lg:w-32">Share</span>
        <span className="w-28 text-right max-md:w-16">vs {yearAgoLabel}</span>
      </div>
      <ul className="flex flex-col">
        {rows.map((row) => (
          <li
            className="flex items-center gap-4 border-separator border-b px-2 py-2.5 hover:bg-surface-secondary max-md:gap-2 max-md:px-0.5"
            key={row.category}
          >
            <span className="flex min-w-0 flex-1 items-center gap-2.5">
              <span
                aria-hidden
                className="size-3 shrink-0 rounded-sm"
                style={{ backgroundColor: row.color }}
              />
              <span className="truncate font-semibold text-sm">
                {row.category}
              </span>
            </span>
            <span className="min-w-0 flex-1 truncate text-muted text-sm max-lg:hidden">
              {row.description}
            </span>
            <span className="w-24 text-right font-semibold text-sm tabular-nums max-md:w-14">
              {row.count.toLocaleString("en-SG")}
            </span>
            <span className="flex w-48 items-center gap-2.5 max-md:w-12 max-lg:w-32">
              <span className="h-2.5 min-w-0 flex-1 rounded-r-sm bg-surface-secondary max-md:hidden">
                <span
                  className="block h-full rounded-r-sm"
                  style={{
                    backgroundColor:
                      row.count === largest
                        ? "var(--chart-1)"
                        : "var(--chart-3)",
                    width: `${largest > 0 ? (row.count / largest) * 100 : 0}%`,
                  }}
                />
              </span>
              <span className="w-12 shrink-0 text-right text-muted-strong text-xs tabular-nums">
                {row.share.toFixed(1)}%
              </span>
            </span>
            <span className="w-28 text-right text-sm max-md:w-16">
              {row.yearAgoChange === null ? (
                <span className="text-muted">—</span>
              ) : (
                <DeltaChip value={row.yearAgoChange} />
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
