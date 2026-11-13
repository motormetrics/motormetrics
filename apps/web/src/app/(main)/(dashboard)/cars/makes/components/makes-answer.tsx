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
 * The page head's answer, in Direction D's range style: the leading make and
 * its count with the change on a year earlier, a twelve-month range bar when
 * one month is shown, one lead sentence, and the key numbers beside it.
 */
export async function MakesAnswer({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { fuel, range } = await loadSearchParams(searchParams);
  const [{ latestMonth, rows, total }, electricOnly] = await Promise.all([
    loadMakeRows(range, fuel),
    loadElectricOnlyMakes(),
  ]);
  const leader = rows[0];

  if (!leader || !latestMonth || total === 0) {
    return null;
  }

  const fuelWord = fuel?.toLowerCase() ?? null;
  const registrations = fuelWord
    ? `${fuelWord} registrations`
    : "registrations";
  const period = periodLabel(latestMonth, range);
  const leadersCount = rows
    .slice(0, LEADERS)
    .reduce((sum, row) => sum + row.count, 0);
  const leadersShare = `${((leadersCount / total) * 100).toFixed(0)}%`;
  const rangeBar = range === "month" ? rangePosition(leader.trend) : null;

  const keyNumbers = [
    {
      label: `${leader.make} share`,
      value: `${leader.share.toFixed(1)}%`,
      note: `${formatCount(leader.count)} of ${formatCount(total)} ${registrations}`,
    },
    {
      label: "Five largest makes",
      value: leadersShare,
      note: rows
        .slice(0, LEADERS)
        .map((row) => row.make)
        .join(", "),
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
    <div className="@container">
      <div className="grid @5xl:grid-cols-3 @5xl:gap-12 gap-8">
        <div className="@5xl:col-span-2 flex flex-col gap-4">
          <div className="flex max-w-xl flex-col gap-3 border-separator border-t pt-4">
            <span className="flex items-center gap-2.5">
              <MakeAvatar
                logoUrl={leader.logoUrl}
                make={leader.make}
                size="sm"
              />
              <Typography.Paragraph size="sm">
                <span className="font-semibold">
                  {fuelWord ? `${fuel} · ` : null}
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
            {fuelWord ? `${fuelWord} ` : ""}cars{" "}
            {range === "month" ? "in" : "from"} {period},{" "}
            {leader.share.toFixed(1)}% of {registrations}; the five largest
            makes held {leadersShare}.
          </Typography.Paragraph>
        </div>

        <aside aria-label="Key numbers" className="flex flex-col gap-3">
          <Typography.Paragraph
            className="uppercase"
            color="muted"
            size="xs"
            weight="semibold"
          >
            Key numbers
          </Typography.Paragraph>
          <dl className="grid @5xl:grid-cols-1 grid-cols-2 gap-x-6">
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
      </div>
    </div>
  );
}
