import { Chip, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  changeRatio,
  formatExercise,
  formatMonth,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { demandLead } from "@web/app/(main)/(dashboard)/coe/results/components/results-captions";
import {
  premiumOf,
  totalFor,
} from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { getCoeResults } from "@web/queries/coe";
import type { COECategory } from "@web/types";

/** The three categories the comp calls out beside the headline. */
const HIGHLIGHT_CATEGORIES: COECategory[] = [
  "Category A",
  "Category B",
  "Category E",
];

/** The sections the key numbers jump to. */
const JUMP_LINKS = [
  { href: "#res-chart", label: "Premium by category" },
  { href: "#res-exercises", label: "Results by exercise" },
  { href: "#res-years", label: "Average by year" },
  { href: "#res-records", label: "Records" },
  { href: "#res-quota", label: "Quota and demand" },
];

const count = (value: number) => value.toLocaleString("en-SG");

/** "−1.2% on the previous exercise", or a note that there is no baseline. */
function movementNote(current: number, previous?: number): string {
  if (!previous) {
    return "no earlier exercise";
  }

  const percent = changeRatio(current, previous) * 100;
  const sign = percent > 0 ? "+" : percent < 0 ? "−" : "";

  return `${sign}${Math.abs(percent).toFixed(1)}% on the previous exercise`;
}

/**
 * The latest exercise and the one before. The head describes the latest
 * exercise whatever period the page shows, so it reads the whole cached
 * history rather than the search params, and stays in the static shell.
 */
async function loadLatest() {
  const exercises = groupByExercise(await getCoeResults());
  return {
    first: exercises[0],
    latest: exercises.at(-1),
    previous: exercises.at(-2),
  };
}

/** " · Second bidding, September 2026", after the head's eyebrow. */
export async function ResultsExerciseName() {
  const { latest } = await loadLatest();

  return latest ? ` · ${formatExercise(latest)}` : null;
}

/**
 * Direction D's hero for the results history: bids per quota across all five
 * categories in the latest exercise, the lead naming the most contested
 * category, and the source line.
 */
export async function ResultsHero() {
  const { first, latest } = await loadLatest();

  if (!latest) {
    return null;
  }

  const totalQuota = totalFor(latest, "quota");
  const totalBids = totalFor(latest, "bidsReceived");

  return (
    <>
      <div className="flex max-w-xl flex-col gap-2.5 border-separator border-t pt-4">
        <Typography.Paragraph className="text-muted-strong">
          <span className="font-semibold text-foreground">Bids per quota</span>{" "}
          · all five categories, latest exercise
        </Typography.Paragraph>
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
          <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight lg:text-5xl">
            {(totalQuota > 0 ? totalBids / totalQuota : 0).toFixed(2)}×
          </span>
          <Chip className="tabular-nums" color="accent" variant="soft">
            {`${count(totalBids)} bids · ${count(totalQuota)} COEs`}
          </Chip>
        </div>
      </div>
      <Typography.Paragraph className="max-w-prose text-lg tabular-nums">
        {demandLead(latest)}
      </Typography.Paragraph>
      <Typography.Paragraph color="muted" size="sm">
        Source: LTA via DataMall.
        {first ? ` Every exercise since ${formatMonth(first.month)}.` : null}
      </Typography.Paragraph>
    </>
  );
}

/** The key numbers beside the head: the car premiums and the quota. */
export async function ResultsKeyNumbers() {
  const { latest, previous } = await loadLatest();

  if (!latest) {
    return null;
  }

  const keyNumbers = [
    ...HIGHLIGHT_CATEGORIES.map((category) => {
      const premium = premiumOf(latest, category) ?? 0;
      return {
        label: `${category} premium`,
        note: movementNote(premium, previous && premiumOf(previous, category)),
        value: formatCurrency(premium),
      };
    }),
    {
      label: "Quota",
      note: "this exercise",
      value: count(totalFor(latest, "quota")),
    },
  ];

  return (
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Key numbers · latest exercise
      </Typography.Paragraph>
      <dl className="grid @3xl:grid-cols-4 @7xl:grid-cols-2 grid-cols-2 gap-x-6 border-separator border-t">
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
      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {JUMP_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                className="text-accent-strong hover:text-accent-deep"
                href={href}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <Typography.Paragraph color="muted" size="xs">
        Source: LTA via DataMall.
      </Typography.Paragraph>
    </aside>
  );
}
