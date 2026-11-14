import { Skeleton } from "@heroui/react";
import {
  loadMakeRows,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { SearchParams } from "nuqs/server";
import { Suspense } from "react";

/** How many makes the bar breaks out before folding the rest together. */
const LEADERS = 5;

interface Segment {
  color: string;
  label: string;
  value: number;
}

interface ConcentrationProps {
  searchParams: Promise<SearchParams>;
}

/**
 * The slices for the selected period and powertrain. Both the caption and the
 * figure call it; `loadMakeRows` is `'use cache'`, so the rows are read once.
 */
async function loadConcentration(searchParams: Promise<SearchParams>) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, rows, total } = await loadMakeRows(range, fuel);
  const leader = rows[0];

  if (!leader || !latestMonth) {
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
  return {
    barTotal: total || 1,
    fuel,
    latestMonth,
    leader,
    range,
    rest,
    segments,
    total,
  };
}

async function ConcentrationCaption({ searchParams }: ConcentrationProps) {
  const concentration = await loadConcentration(searchParams);
  if (!concentration) {
    return "No registrations for this selection.";
  }

  const { barTotal, leader, rest, total } = concentration;
  const leadersShare = ((total - rest) / barTotal) * 100;

  return `The five largest makes held ${leadersShare.toFixed(0)}% of registrations; ${leader.make} alone held ${((leader.count / barTotal) * 100).toFixed(1)}%.`;
}

async function ConcentrationFigure({ searchParams }: ConcentrationProps) {
  const concentration = await loadConcentration(searchParams);
  if (!concentration) {
    return null;
  }

  const { barTotal, fuel, latestMonth, range, segments, total } = concentration;

  return (
    <>
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
    </>
  );
}

/**
 * Figure 2: the top five makes against the rest, as one stacked bar of shares
 * with a tile per slice beneath, as Direction D draws it.
 *
 * The heading is in the static shell. The caption and the figure follow the
 * period and powertrain, so each waits behind its own boundary.
 */
export function ConcentrationCard({ searchParams }: ConcentrationProps) {
  return (
    <div className="@container flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={" "}>
            <ConcentrationCaption searchParams={searchParams} />
          </Suspense>
        }
        eyebrow="Concentration"
        title="Top five makes against the rest"
      />
      <Suspense fallback={<Skeleton className="h-28 w-full" />}>
        <ConcentrationFigure searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
