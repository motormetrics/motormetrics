import {
  loadMakeRows,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { SearchParams } from "nuqs/server";

/** How many makes the bar breaks out before folding the rest together. */
const LEADERS = 5;

interface Segment {
  color: string;
  label: string;
  value: number;
}

/**
 * Figure 2: the top five makes against the rest, as one stacked bar of shares
 * with a tile per slice beneath, as Direction D draws it.
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
    <div className="@container flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`The five largest makes held ${leadersShare.toFixed(0)}% of registrations; ${leaders[0].make} alone held ${((leaders[0].count / barTotal) * 100).toFixed(1)}%.`}
        eyebrow="Concentration"
        title="Top five makes against the rest"
      />
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
      {/* One tile per slice: two across on a phone, all six in a row once
          the page is wide enough. */}
      <ul className="grid @3xl:grid-cols-3 @6xl:grid-cols-6 grid-cols-2 gap-x-6">
        {segments.map((segment) => (
          <li
            className="flex flex-col gap-0.5 border-separator border-t py-3"
            key={segment.label}
          >
            <span className="flex items-center gap-2 text-muted text-xs">
              <span
                aria-hidden
                className="size-2.5 shrink-0 rounded-xs"
                style={{ background: segment.color }}
              />
              <span className="truncate">{segment.label}</span>
            </span>
            <span className="font-bold text-xl tabular-nums">
              {((segment.value / barTotal) * 100).toFixed(1)}%
            </span>
            <span className="text-muted text-xs tabular-nums">
              {segment.value.toLocaleString("en-SG")} cars
            </span>
          </li>
        ))}
      </ul>
      <SourceNote>
        Share of {total.toLocaleString("en-SG")} registrations
        {fuel ? ` of ${fuel.toLowerCase()} cars` : ""},{" "}
        {periodLabel(latestMonth, range)}.
      </SourceNote>
    </div>
  );
}
