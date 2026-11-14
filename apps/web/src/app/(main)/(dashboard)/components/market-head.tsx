import { ProgressBar, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  biddingOrdinal,
  premiumRangeStats,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  leadSentence,
  rangeWhere,
  signed,
} from "@web/app/(main)/(dashboard)/components/market-copy";
import {
  sumByMonth,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  getEvMarketShare,
  getEvMonthlyTrend,
  getMonthlyRegistrationTotals,
  getYearToDateByFuelType,
} from "@web/queries/cars";
import { getCategoryExercises, getPqpRates } from "@web/queries/coe";
import { getDeregistrations } from "@web/queries/deregistrations";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

/** The window the Category A range bar spans: a year of exercises. */
const RANGE_EXERCISES = 24;
/** Deep enough for the lead's "the fewest since" look-back. */
const HISTORY_LIMIT = 24;

/** The sections below, for the "On this page" list. */
export const SECTION_LINKS = [
  { href: "#coe-premiums", label: "COE premiums" },
  { href: "#pqp", label: "PQP renewal rates" },
  { href: "#fuel-types", label: "New cars by fuel type" },
  { href: "#top-makes", label: "Top makes" },
  { href: "#on-the-road", label: "Off the road and on it" },
];

/** "first bidding, November 2026". */
const exerciseName = (exercise: { biddingNo: number; month: string }) =>
  `${biddingOrdinal(exercise.biddingNo)} bidding, ${formatMonthLabel(exercise.month)}`;

/** "+$6,997", with a true minus for a fall. */
const signedCurrency = (value: number) =>
  `${value < 0 ? "−" : "+"}${formatCurrency(Math.abs(value))}`;

/**
 * Direction D's "range" hero: the latest Category A premium at heading size
 * with its change, a bar placing it in the last 24 exercises, then the lead
 * and the source line. Reads only cached data, so it is part of the static
 * shell.
 */
export async function MarketHero() {
  const month = await getLatestMonth("cars");
  const [categoryA, monthlyTotals, evTrend, evMarketShare] = await Promise.all([
    getCategoryExercises("Category A"),
    getMonthlyRegistrationTotals(HISTORY_LIMIT),
    getEvMonthlyTrend(),
    getEvMarketShare(),
  ]);

  const window = categoryA.slice(-RANGE_EXERCISES);
  const range = premiumRangeStats(window);
  const previous = categoryA.at(-2);

  const evIndex = resolveMonthIndex(
    evTrend.map((point) => point.month),
    month,
  );
  const evShare =
    evIndex >= 0
      ? batteryElectricShares(evTrend, evMarketShare)[evIndex]
      : undefined;
  const lead = leadSentence(
    windowEndingAt(monthlyTotals, month, HISTORY_LIMIT),
    evShare,
  );

  return (
    <>
      {range ? (
        <div className="flex flex-col gap-3">
          <Typography.Paragraph color="muted" size="sm">
            <span className="font-semibold text-foreground">
              COE Category A
            </span>{" "}
            · {exerciseName(range.latest)}
          </Typography.Paragraph>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="font-bold text-4xl tabular-nums tracking-tight md:text-5xl">
              {formatCurrency(range.latest.premium)}
            </span>
            {previous ? (
              <span className="text-muted-strong text-sm tabular-nums">
                {signed(
                  changeRatio(range.latest.premium, previous.premium) * 100,
                )}{" "}
                · {signedCurrency(range.latest.premium - previous.premium)}
              </span>
            ) : null}
          </div>
          <ProgressBar
            aria-label={`Against the last ${window.length} exercises: low ${formatCurrency(range.low.premium)}, high ${formatCurrency(range.high.premium)}`}
            className="max-w-xl gap-2"
            maxValue={range.high.premium}
            minValue={range.low.premium}
            size="sm"
            value={range.latest.premium}
          >
            <ProgressBar.Track className="col-span-full">
              <ProgressBar.Fill />
            </ProgressBar.Track>
            <span className="col-span-full flex justify-between gap-4 text-muted text-xs tabular-nums">
              <span>
                {window.length}-exercise low {formatCurrency(range.low.premium)}
              </span>
              <span className="max-sm:hidden">
                {rangeWhere(
                  range.latest.premium,
                  range.low.premium,
                  range.high.premium,
                  window.length,
                )}
              </span>
              <span>High {formatCurrency(range.high.premium)}</span>
            </span>
          </ProgressBar>
        </div>
      ) : null}
      {lead ? (
        <Typography.Paragraph className="max-w-prose tabular-nums">
          {lead}
        </Typography.Paragraph>
      ) : null}
      <Typography.Paragraph color="muted" size="sm">
        Source: LTA via DataMall. Registrations to {formatMonthLabel(month)}
        {range ? `; COE to the ${exerciseName(range.latest)}` : ""}.
      </Typography.Paragraph>
    </>
  );
}

interface KeyNumber {
  label: string;
  note: string;
  value: string;
}

/**
 * The key numbers beside the head on a wide page and under it before then,
 * with the "On this page" links. COE and PQP lead, as the page order does.
 */
export async function MarketKeyNumbers() {
  const month = await getLatestMonth("cars");
  const [
    categoryB,
    pqpRates,
    monthlyTotals,
    yearToDate,
    evTrend,
    evMarketShare,
    deregistrations,
  ] = await Promise.all([
    getCategoryExercises("Category B"),
    getPqpRates(),
    getMonthlyRegistrationTotals(HISTORY_LIMIT),
    getYearToDateByFuelType(Number(month.slice(0, 4))),
    getEvMonthlyTrend(),
    getEvMarketShare(),
    getDeregistrations(),
  ]);

  const keyNumbers: KeyNumber[] = [];

  const [latestB, previousB] = [categoryB.at(-1), categoryB.at(-2)];
  if (latestB) {
    keyNumbers.push({
      label: "COE Category B",
      note: `${previousB ? `${signed(changeRatio(latestB.premium, previousB.premium) * 100)} · ` : ""}${biddingOrdinal(latestB.biddingNo)} bidding, ${formatMonthName(latestB.month)}`,
      value: formatCurrency(latestB.premium),
    });
  }

  const [pqpMonth, previousPqpMonth] = Object.keys(pqpRates).sort().reverse();
  for (const category of ["Category A", "Category B"] as const) {
    const rate = pqpMonth ? pqpRates[pqpMonth]?.[category] : undefined;
    if (!pqpMonth || rate === undefined) {
      continue;
    }
    const before = previousPqpMonth
      ? pqpRates[previousPqpMonth]?.[category]
      : undefined;
    keyNumbers.push({
      label: `PQP ${category}, ${formatMonthName(pqpMonth)}`,
      note:
        previousPqpMonth && before !== undefined
          ? `${signed(changeRatio(rate, before) * 100)} vs ${formatMonthName(previousPqpMonth)}`
          : "Three-month moving average",
      value: formatCurrency(rate),
    });
  }

  const registrations = windowEndingAt(monthlyTotals, month, 2);
  const [previousCars, latestCars] =
    registrations.length === 2 ? registrations : [undefined, registrations[0]];
  if (latestCars) {
    const yearTotal = yearToDate.reduce((sum, row) => sum + row.count, 0);
    keyNumbers.push({
      label: `New cars, ${formatMonthName(latestCars.month)}`,
      note: [
        previousCars
          ? `${signed(changeRatio(latestCars.total, previousCars.total) * 100)} vs ${formatMonthName(previousCars.month)}`
          : null,
        yearTotal > 0
          ? `${yearTotal.toLocaleString("en-SG")} in ${month.slice(0, 4)}`
          : null,
      ]
        .filter(Boolean)
        .join(" · "),
      value: latestCars.total.toLocaleString("en-SG"),
    });
  }

  const evIndex = resolveMonthIndex(
    evTrend.map((point) => point.month),
    month,
  );
  const shares = batteryElectricShares(evTrend, evMarketShare);
  const evShare = evIndex >= 0 ? shares[evIndex] : undefined;
  if (evShare !== undefined) {
    const before = evIndex > 0 ? shares[evIndex - 1] : undefined;
    keyNumbers.push({
      label: "Battery-electric share",
      note:
        before !== undefined
          ? `${signed(evShare - before, " pts")} vs ${formatMonthName(evTrend[evIndex - 1].month)}`
          : `of new cars, ${formatMonthName(evTrend[evIndex].month)}`,
      value: `${evShare.toFixed(1)}%`,
    });
  }

  const deregistrationTotals = sumByMonth(deregistrations);
  const [latestDereg, previousDereg] = [
    deregistrationTotals.at(-1),
    deregistrationTotals.at(-2),
  ];
  if (latestDereg) {
    keyNumbers.push({
      label: `Deregistrations, ${formatMonthName(latestDereg.month)}`,
      note: previousDereg
        ? `${signed(changeRatio(latestDereg.total, previousDereg.total) * 100)} vs ${formatMonthName(previousDereg.month)}`
        : "All vehicle types",
      value: latestDereg.total.toLocaleString("en-SG"),
    });
  }

  if (keyNumbers.length === 0) {
    return null;
  }

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
      <dl className="grid @3xl:grid-cols-3 grid-cols-2 gap-x-6 border-separator border-t">
        {keyNumbers.map(({ label, note, value }) => (
          <div
            className="flex min-w-0 flex-col gap-0.5 border-separator border-b py-3"
            key={label}
          >
            <dt className="font-semibold text-muted text-xs">{label}</dt>
            <dd className="font-semibold text-xl tabular-nums">{value}</dd>
            <dd className="text-muted text-xs tabular-nums">{note}</dd>
          </div>
        ))}
      </dl>
      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
          {SECTION_LINKS.map((link) => (
            <li key={link.href}>
              <a
                className="font-medium text-accent-strong no-underline hover:text-accent-deep"
                href={link.href}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Typography.Paragraph color="muted" size="xs">
        Source: LTA via DataMall. Changes are against the previous month or
        exercise.
      </Typography.Paragraph>
    </aside>
  );
}
