import { Typography } from "@heroui/react";
import type { SearchParams } from "nuqs/server";
import { loadSearchParams } from "../search-params";
import { loadMakeRows } from "./make-rows";

/** How many makes the ring breaks out before folding the rest together. */
const LEADERS = 5;

const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Arc length removed from each segment so the rounded caps read as separate. */
const SEGMENT_GAP = 16;

interface Segment {
  color: string;
  label: string;
  value: number;
}

/**
 * The "Concentration" block: the top five makes against the rest, drawn as a
 * gapped ring with its legend beside it.
 *
 * The arc maths is `shared/donut-gauge.tsx`'s, restated here because that
 * component stacks its legend under the ring and the v3 comp puts the two side
 * by side.
 */
export async function ConcentrationCard({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { rows, total } = await loadMakeRows(range, fuel);

  if (rows.length === 0) {
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

  const leadersTotal = leaders.reduce((sum, row) => sum + row.count, 0);
  const leadersShare = total > 0 ? (leadersTotal / total) * 100 : 0;
  const ringTotal = total || 1;

  let consumed = 0;
  const arcs = segments.map((segment) => {
    const full = (segment.value / ringTotal) * CIRCUMFERENCE;
    // Floor at 2px so a rounding-to-zero share still shows as a tick rather
    // than vanishing from the ring.
    const dash = Math.max(2, full - SEGMENT_GAP);
    const arc = {
      color: segment.color,
      dashArray: `${dash.toFixed(2)} ${(CIRCUMFERENCE - dash).toFixed(2)}`,
      dashOffset: (-(consumed + SEGMENT_GAP / 2)).toFixed(2),
      key: segment.label,
    };
    consumed += full;
    return arc;
  });

  return (
    <div className="flex flex-col gap-2.5">
      <Typography.Paragraph className="font-semibold text-muted-strong text-xl">
        Concentration
      </Typography.Paragraph>
      <Typography.Paragraph className="font-medium" color="muted">
        Top five makes against the rest
      </Typography.Paragraph>

      <div className="mt-2 flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-9">
        <div className="relative size-[172px] shrink-0">
          <svg className="block size-full" role="img" viewBox="0 0 190 190">
            <title>Share of registrations held by the five largest makes</title>
            <g transform="rotate(-90 95 95)">
              {arcs.map((arc) => (
                <circle
                  cx={95}
                  cy={95}
                  fill="none"
                  key={arc.key}
                  r={RADIUS}
                  stroke={arc.color}
                  strokeDasharray={arc.dashArray}
                  strokeDashoffset={arc.dashOffset}
                  strokeLinecap="round"
                  strokeWidth={24}
                />
              ))}
            </g>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="font-extrabold text-[33px] tabular-nums leading-none tracking-tight">
              {leadersShare.toFixed(0)}%
            </span>
            <Typography.Paragraph
              className="font-semibold"
              color="muted"
              size="sm"
            >
              top five share
            </Typography.Paragraph>
          </div>
        </div>

        <ul className="flex min-w-0 flex-1 flex-col gap-2.5">
          {segments.map((segment) => (
            <li className="flex items-center gap-2.5" key={segment.label}>
              <span
                aria-hidden
                className="size-[11px] shrink-0 rounded-full"
                style={{ background: segment.color }}
              />
              <Typography.Paragraph
                className="font-semibold text-[15.5px] text-foreground/85"
                size="sm"
                truncate
              >
                {segment.label}
              </Typography.Paragraph>
              <span className="ml-auto shrink-0 font-extrabold text-[15.5px] tabular-nums">
                {((segment.value / ringTotal) * 100).toFixed(1)}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
