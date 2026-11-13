import { ProgressBar, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  loadElectricOnlyMakes,
  loadMakeRows,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  loadSearchParams,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import type { SearchParams } from "nuqs/server";

/** How many makes "the largest makes" counts. */
const LEADERS = 5;

const formatCount = (value: number) => value.toLocaleString("en-SG");

/**
 * Where the leader's latest month sits in its last twelve, for the range bar
 * under a single-month answer. Null when the twelve months are all equal.
 */
export function rangePosition(trend: readonly number[]) {
  const latest = trend.at(-1);
  if (latest === undefined) {
    return null;
  }
  const high = Math.max(...trend);
  const low = Math.min(...trend);
  if (high === low) {
    return null;
  }

  const where =
    latest === high
      ? "Highest in 12 months"
      : latest === low
        ? "Lowest in 12 months"
        : `${(((high - latest) / high) * 100).toFixed(1)}% below the high`;

  return {
    high,
    low,
    position: ((latest - low) / (high - low)) * 100,
    where,
  };
}

/**
 * The leader and the five largest makes for the selected range and fuel,
 * read by both the answer and the key numbers. `loadMakeRows` is cached, so
 * the two share one entry.
 */
async function loadLeaders(searchParams: Promise<SearchParams>) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const { latestMonth, rows, total } = await loadMakeRows(range, fuel);
  const leader = rows[0];

  if (!leader || !latestMonth || total === 0) {
    return null;
  }

  const leaders = rows.slice(0, LEADERS);
  const leadersCount = leaders.reduce((sum, row) => sum + row.count, 0);
  const fuelWord = fuel?.toLowerCase() ?? null;

  return {
    fuel,
    fuelWord,
    latestMonth,
    leader,
    leaders,
    leadersShare: `${((leadersCount / total) * 100).toFixed(0)}%`,
    period: periodLabel(latestMonth, range),
    range,
    registrations: fuelWord ? `${fuelWord} registrations` : "registrations",
    rows,
    total,
  };
}

/**
 * The page head's answer, in Direction D's range style: the leading make and
 * its count with the change on a year earlier, a twelve-month range bar when
 * one month is shown, and one lead sentence.
 */
export async function MakesAnswer({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const answer = await loadLeaders(searchParams);
  if (!answer) {
    return null;
  }

  const { fuel, fuelWord, leader, leadersShare, period, range, registrations } =
    answer;
  const rangeBar = range === "month" ? rangePosition(leader.trend) : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex max-w-xl flex-col gap-3 border-separator border-t pt-4">
        <span className="flex items-center gap-2.5">
          <MakeAvatar logoUrl={leader.logoUrl} make={leader.make} size="sm" />
          <Typography.Paragraph size="sm">
            <span className="font-semibold">
              {fuel ? `${fuel} · ` : null}
              {leader.make} leads the market
            </span>{" "}
            · {RANGE_LABELS[range]}
          </Typography.Paragraph>
        </span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight">
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={leader.count}
            />
          </span>
          <span className="rounded-md bg-accent-soft px-2 py-0.5 font-semibold text-accent-soft-foreground text-sm">
            {leader.yoyChange === null ? (
              "No change to compare"
            ) : (
              <>
                <DeltaChip
                  className="text-accent-soft-foreground"
                  value={leader.yoyChange}
                />{" "}
                on a year earlier
              </>
            )}
          </span>
        </span>
        {rangeBar ? (
          <ProgressBar
            aria-label={`Against the last 12 months: low ${formatCount(rangeBar.low)}, high ${formatCount(rangeBar.high)}, now ${formatCount(leader.count)}. ${rangeBar.where}.`}
            className="gap-1.5"
            size="sm"
            value={rangeBar.position}
          >
            <ProgressBar.Track className="col-span-full">
              <ProgressBar.Fill />
            </ProgressBar.Track>
            <span className="col-span-full flex justify-between gap-3 text-muted text-xs tabular-nums">
              <span>12-month low {formatCount(rangeBar.low)}</span>
              <span className="font-semibold text-foreground">
                {rangeBar.where}
              </span>
              <span>High {formatCount(rangeBar.high)}</span>
            </span>
          </ProgressBar>
        ) : null}
      </div>
      <Typography.Paragraph className="max-w-prose tabular-nums">
        {leader.make} registered {formatCount(leader.count)}{" "}
        {fuelWord ? `${fuelWord} ` : ""}cars {range === "month" ? "in" : "from"}{" "}
        {period}, {leader.share.toFixed(1)}% of {registrations}; the five
        largest makes held {leadersShare}.
      </Typography.Paragraph>
    </div>
  );
}

/**
 * The key numbers beside the page head. They sit in their own column of the
 * head grid, so on a wide page they start level with the title.
 */
export async function MakesKeyNumbers({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [answer, electricOnly] = await Promise.all([
    loadLeaders(searchParams),
    loadElectricOnlyMakes(),
  ]);
  if (!answer) {
    return null;
  }

  const {
    fuelWord,
    latestMonth,
    leader,
    leaders,
    leadersShare,
    period,
    registrations,
    rows,
    total,
  } = answer;

  const keyNumbers = [
    {
      label: `${leader.make} share`,
      value: `${leader.share.toFixed(1)}%`,
      note: `${formatCount(leader.count)} of ${formatCount(total)} ${registrations}`,
    },
    {
      label: "Five largest makes",
      value: leadersShare,
      note: leaders.map((row) => row.make).join(", "),
    },
    {
      label: "Makes with registrations",
      value: formatCount(rows.length),
      note: fuelWord ? `${period} · ${fuelWord}` : period,
    },
    ...(electricOnly
      ? [
          {
            label: "Electric-only makes",
            value: formatCount(electricOnly.makes.length),
            note: `${electricOnly.sharePercent.toFixed(1)}% of registrations · ${periodLabel(latestMonth, "ytd")}`,
          },
        ]
      : []),
  ];

  return (
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Key numbers
      </Typography.Paragraph>
      {/* Four across while it sits under the head, one column once it moves
          beside it. */}
      <dl className="grid @3xl:grid-cols-4 @7xl:grid-cols-1 grid-cols-2 gap-x-6">
        {keyNumbers.map(({ label, note, value }) => (
          <div
            className="flex flex-col gap-0.5 border-separator border-t py-3"
            key={label}
          >
            <dt className="text-muted text-xs">{label}</dt>
            <dd className="font-bold text-xl tabular-nums">{value}</dd>
            <dd className="text-muted text-xs tabular-nums">{note}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
