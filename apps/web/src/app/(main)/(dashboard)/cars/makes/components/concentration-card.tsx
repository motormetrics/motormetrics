import { Skeleton } from "@heroui/react";
import { loadMakeRows } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { IndexPeriod } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-index";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { FigureCard } from "@web/components/shared/figure-card";
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

/** One stacked bar of shares, with a legend row per slice. */
async function ConcentrationFigure({ searchParams }: ConcentrationProps) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows, total } = await loadMakeRows(range, fuel);
  if (rows.length === 0 || total === 0) {
    return null;
  }

  const rest = rows.slice(LEADERS).reduce((sum, row) => sum + row.count, 0);
  const segments: Segment[] = rows.slice(0, LEADERS).map((row, index) => ({
    color: `var(--chart-${index + 1})`,
    label: row.make,
    value: row.count,
  }));
  if (rest > 0) {
    segments.push({
      color: "var(--muted)",
      label: "All other makes",
      value: rest,
    });
  }

  return (
    <>
      <div
        aria-label="Share of registrations held by the five largest makes"
        className="flex h-4 gap-0.5 overflow-hidden rounded-xs"
        role="img"
      >
        {segments.map((segment) => (
          <span
            className="block h-full"
            key={segment.label}
            // A width from the data has no utility class.
            style={{
              background: segment.color,
              width: `${((segment.value / total) * 100).toFixed(2)}%`,
            }}
          />
        ))}
      </div>
      <ul className="flex flex-col">
        {segments.map((segment) => (
          <li
            className="flex items-center gap-2 border-separator border-t py-2 text-sm first:border-t-0"
            key={segment.label}
          >
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-xs"
              style={{ background: segment.color }}
            />
            <span className="min-w-0 flex-1 truncate">{segment.label}</span>
            <span className="text-muted tabular-nums">
              {segment.value.toLocaleString("en-SG")}
            </span>
            <span className="w-14 text-right font-semibold tabular-nums">
              {((segment.value / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** The five largest makes against the rest, for the period and powertrain. */
export function ConcentrationCard({ searchParams }: ConcentrationProps) {
  return (
    <FigureCard
      description={
        <Suspense fallback={" "}>
          <IndexPeriod searchParams={searchParams} />
        </Suspense>
      }
      title="Five largest makes against the rest"
    >
      <Suspense fallback={<Skeleton className="h-56 w-full" />}>
        <ConcentrationFigure searchParams={searchParams} />
      </Suspense>
    </FigureCard>
  );
}
