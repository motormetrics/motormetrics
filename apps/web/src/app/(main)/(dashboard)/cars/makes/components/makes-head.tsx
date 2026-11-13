import { Typography } from "@heroui/react";
import {
  loadElectricOnlyMakes,
  loadMakeRows,
  type MakeRow,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { formatMonthLabel } from "@web/utils/dates/format-month";

/** How many makes "the largest makes" counts. */
const LEADERS = 5;

/** Below this many registrations a make counts as part of the long tail. */
const SMALL_MAKE = 100;

const formatCount = (value: number) => value.toLocaleString("en-SG");

/**
 * The lead under the title, e.g. "Toyota (11.7%) and Tesla (9.9%) followed
 * BYD from January to October 2026, and 33 of the 63 makes registered fewer
 * than 100 cars each."
 */
export function leadSentence(rows: readonly MakeRow[], period: string) {
  const [first, second, third] = rows;
  if (!first) {
    return null;
  }

  const small = rows.filter((row) => row.count < SMALL_MAKE).length;
  const tail = `${small} of the ${rows.length} makes registered fewer than ${SMALL_MAKE} cars each`;

  if (!second || !third) {
    return `${first.make} led from ${period}, and ${tail}.`;
  }

  return `${second.make} (${second.share.toFixed(1)}%) and ${third.make} (${third.share.toFixed(1)}%) followed ${first.make} from ${period}, and ${tail}.`;
}

/**
 * The lead and source line under the title, in Direction D's wording. Both
 * describe the year to date whatever period the index shows, so the head
 * reads no search params and stays in the static shell.
 */
export async function MakesLead() {
  const { latestMonth, rows } = await loadMakeRows("ytd", null);
  if (!latestMonth) {
    return null;
  }

  return (
    <>
      <Typography.Paragraph className="max-w-prose tabular-nums">
        {leadSentence(rows, periodLabel(latestMonth, "ytd"))}
      </Typography.Paragraph>
      <Typography.Paragraph color="muted" size="sm">
        Source: LTA via DataMall. Registrations to{" "}
        {formatMonthLabel(latestMonth)}.
      </Typography.Paragraph>
    </>
  );
}

/**
 * The key numbers beside the page head, for the year to date. They sit in
 * their own column of the head grid, so on a wide page they start level with
 * the title.
 */
export async function MakesKeyNumbers() {
  const [ytd, month, electricOnly] = await Promise.all([
    loadMakeRows("ytd", null),
    loadMakeRows("month", null),
    loadElectricOnlyMakes(),
  ]);
  const { latestMonth, rows, total } = ytd;
  const leader = rows[0];

  if (!leader || !latestMonth || total === 0) {
    return null;
  }

  const leaders = rows.slice(0, LEADERS);
  const leadersCount = leaders.reduce((sum, row) => sum + row.count, 0);
  const period = periodLabel(latestMonth, "ytd");

  const keyNumbers = [
    {
      label: "Makes with registrations",
      value: formatCount(rows.length),
      note: `${period} · ${month.rows.length} in ${formatMonthLabel(latestMonth)}`,
    },
    {
      label: "Largest make",
      value: `${leader.make} ${leader.share.toFixed(1)}%`,
      note: `${formatCount(leader.count)} of ${formatCount(total)} new cars`,
    },
    {
      label: "Five largest makes",
      value: `${((leadersCount / total) * 100).toFixed(1)}%`,
      note: leaders.map((row) => row.make).join(", "),
    },
    ...(electricOnly
      ? [
          {
            label: "Electric-only makes",
            value: formatCount(electricOnly.makes.length),
            note: `${electricOnly.sharePercent.toFixed(1)}% of registrations to date`,
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
            className="flex flex-col gap-0.5 border-separator border-b py-3"
            key={label}
          >
            <dt className="font-semibold text-muted text-xs">{label}</dt>
            <dd className="font-semibold text-xl tabular-nums">{value}</dd>
            <dd className="text-muted text-xs tabular-nums">{note}</dd>
          </div>
        ))}
      </dl>
      <Typography.Paragraph color="muted" size="xs">
        Source: LTA via DataMall.
      </Typography.Paragraph>
    </aside>
  );
}
