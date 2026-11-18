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
 * The slices for the selected period and fuel type. Both the caption and the
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
      color: "var(--muted)",
      label: `${rows.length - LEADERS} other makes`,
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

/** The period, and the fuel type when one is selected, after the title. */
async function ConcentrationPeriod({ searchParams }: ConcentrationProps) {
  const concentration = await loadConcentration(searchParams);
  if (!concentration) {
    return "No registrations for this selection.";
  }

  const { fuel, latestMonth, range } = concentration;

  return `${periodLabel(latestMonth, range)}${fuel ? `, ${fuel} cars` : ""}`;
}

async function ConcentrationFigure({ searchParams }: ConcentrationProps) {
  const concentration = await loadConcentration(searchParams);
  if (!concentration) {
    return null;
  }

  const { barTotal, fuel, leader, rest, segments, total } = concentration;
  const leadersShare = ((total - rest) / barTotal) * 100;

  return (
    <>
      <div
        aria-label="Share of new cars held by the five largest makes"
        className="flex h-6 gap-0.5"
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
      {/* One legend entry per slice: two across on a phone, four once there
          is room. */}
      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 md:grid-cols-4">
        {segments.map((segment) => (
          <li
            className="flex min-w-0 items-center gap-2 text-sm"
            key={segment.label}
          >
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-xs"
              style={{ background: segment.color }}
            />
            <span className="min-w-0 flex-1 truncate">{segment.label}</span>
            <span className="font-semibold tabular-nums">
              {((segment.value / barTotal) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
      <SourceNote>
        The five largest makes held {leadersShare.toFixed(0)}% of{" "}
        {total.toLocaleString("en-SG")} new{fuel ? ` ${fuel}` : ""} cars;{" "}
        {leader.make} alone held {((leader.count / barTotal) * 100).toFixed(1)}
        %.
      </SourceNote>
    </>
  );
}

/**
 * The five largest makes against the rest, as one stacked bar of shares with
 * a legend entry per slice.
 *
 * The heading is in the static shell. The period and the figure follow the
 * period and fuel type, so each waits behind its own boundary.
 */
export function ConcentrationCard({ searchParams }: ConcentrationProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4" id="makes-share">
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={"\u00a0"}>
            <ConcentrationPeriod searchParams={searchParams} />
          </Suspense>
        }
        title="Share of new cars"
      />
      <Suspense fallback={<Skeleton className="h-28 w-full" />}>
        <ConcentrationFigure searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
