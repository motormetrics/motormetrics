import { Typography } from "@heroui/react";
import {
  loadMakeRows,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  isFuelFilter,
  loadSearchParams,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { SourceNote } from "@web/components/shared/overview";
import type { SearchParams } from "nuqs/server";

/** How many makes the bar breaks out before folding the rest together. */
const LEADERS = 5;

interface Segment {
  color: string;
  label: string;
  value: number;
}

/**
 * The "Concentration" block: the top five makes against the rest, as one
 * stacked bar of shares with a ruled legend beneath, as the Hybrid comp draws
 * it.
 */
export async function ConcentrationCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, rows, total } = await loadMakeRows(range, fuel);

  if (rows.length === 0 || !latestMonth) {
    return null;
  }

  const leaders = rows.slice(0, LEADERS);
  const rest = rows.slice(LEADERS).reduce((sum, row) => sum + row.count, 0);

  const segments: Segment[] = leaders.map((row, index) => ({
    color: `var(--chart-${index + 1})`,
    label: row.make,
    value: row.count,
  }));
  if (rest > 0) {
    segments.push({
      color: "var(--chart-6)",
      label: "All other makes",
      value: rest,
    });
  }

  // The leaders plus the folded tail cover every row, so the segments sum to
  // `total`.
  const barTotal = total || 1;
  const leadersShare = ((total - rest) / barTotal) * 100;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Typography.Paragraph color="muted" size="xs" weight="semibold">
        Concentration · top five makes against the rest
      </Typography.Paragraph>
      <div className="flex flex-wrap items-baseline gap-2.5">
        <span className="font-bold text-3xl tabular-nums tracking-tight">
          {leadersShare.toFixed(0)}%
        </span>
        <Typography.Paragraph color="muted" size="sm">
          of registrations held by the five largest makes
        </Typography.Paragraph>
      </div>
      <div
        aria-label="Share of registrations held by the five largest makes"
        className="flex h-4 gap-0.5"
        role="img"
      >
        {segments.map((segment) => (
          <span
            className="block h-full"
            key={segment.label}
            style={{
              background: segment.color,
              width: `${((segment.value / barTotal) * 100).toFixed(2)}%`,
            }}
          />
        ))}
      </div>
      <ul className="flex flex-col">
        {segments.map((segment) => (
          <li
            className="flex items-center gap-2.5 border-separator border-b py-2"
            key={segment.label}
          >
            <span
              aria-hidden
              className="size-3 shrink-0 rounded-xs"
              style={{ background: segment.color }}
            />
            <span className="min-w-0 flex-1 truncate text-sm">
              {segment.label}
            </span>
            <span className="font-semibold text-sm tabular-nums">
              {((segment.value / barTotal) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
      <SourceNote>
        Share of {total.toLocaleString("en-SG")} registrations
        {isFuelFilter(fuel) ? ` of ${fuel.toLowerCase()} cars` : ""},{" "}
        {periodLabel(latestMonth, range)}.
      </SourceNote>
    </div>
  );
}
