import { Chip, Skeleton, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { RangeBar } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/range-bar";
import {
  CATEGORIES,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/report-data";
import {
  leadSentence,
  rangeStats,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/summary";
import {
  formatMonthLabel,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";
import { Suspense } from "react";

const formatCount = (value: number) => value.toLocaleString("en-SG");

/** The four COE categories the key numbers set beside the head. */
const KEY_CATEGORIES = CATEGORIES.slice(0, 4);

/** The links the comp lists under the key numbers, to each figure below. */
const JUMP_LINKS = [
  { href: "#dr-trend", label: "Deregistrations by month" },
  { href: "#dr-categories", label: "By category" },
  { href: "#dr-months", label: "Month by month" },
  { href: "#dr-about", label: "What a deregistration is" },
];

/** "August 2026", wherever a label names the selected month. */
export async function ReportMonth({ report }: ReportProps) {
  const { month } = await report;

  return formatMonthLabel(month);
}

/** "Dec 2025", for the denser labels. */
export async function ReportMonthShort({ report }: ReportProps) {
  const { month } = await report;

  return formatMonthShortLabel(month);
}

async function HeroFigures({ report }: ReportProps) {
  const {
    categories,
    change,
    month,
    monthlyRows,
    priorMonth,
    priorTotal,
    total,
  } = await report;
  if (total === 0) {
    return null;
  }

  const difference = total - priorTotal;
  const sign = difference < 0 ? "−" : "+";
  const range = rangeStats(monthlyRows, month);

  return (
    <>
      <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
        <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight">
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={total} />
        </span>
        {priorTotal > 0 ? (
          <Chip className="tabular-nums" color="accent" variant="soft">
            {`${sign}${Math.abs((difference / priorTotal) * 100).toFixed(1)}% · ${sign}${formatCount(Math.abs(difference))}`}
          </Chip>
        ) : null}
      </div>
      {range ? (
        <RangeBar
          ariaLabel={`Against the ${range.count} months to ${formatMonthLabel(month)}: low ${formatCount(range.low)}, high ${formatCount(range.high)}, now ${formatCount(range.latest)}. ${range.where}.`}
          high={range.high}
          highLabel={`High ${formatCount(range.high)}`}
          low={range.low}
          lowLabel={`${range.count}-month low ${formatCount(range.low)}`}
          value={range.latest}
          where={range.where}
        />
      ) : null}
      <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
        {priorTotal > 0
          ? `vs ${formatMonthLabel(priorMonth)} at ${formatCount(priorTotal)} · `
          : ""}
        {categories.length} categories
        {change ? ` · ${change} on a year earlier` : ""}
      </Typography.Paragraph>
    </>
  );
}

/**
 * Direction D's range hero: the month's total, its change on the month
 * before, and where it sits in the trailing year. The label is in the static
 * shell; the figures wait on the selected month.
 */
export function DeregistrationsHero({ report }: ReportProps) {
  return (
    <div className="flex max-w-xl flex-col gap-2.5 border-separator border-t pt-4">
      <Typography.Paragraph color="muted" size="sm">
        <span className="font-semibold text-foreground">
          Vehicles deregistered
        </span>{" "}
        · {/* A non-breaking space holds the line until the month arrives. */}
        <Suspense fallback=" ">
          <ReportMonth report={report} />
        </Suspense>
      </Typography.Paragraph>
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <HeroFigures report={report} />
      </Suspense>
    </div>
  );
}

/** The lead under the hero, from the month's largest category. */
export async function DeregistrationsLead({ report }: ReportProps) {
  const { categories, change, month, total } = await report;

  return (
    leadSentence(categories, total, month, change) ??
    `No deregistration data available for ${formatMonthLabel(month)}.`
  );
}

async function KeyNumberList({ report }: ReportProps) {
  const { total, totals } = await report;

  return KEY_CATEGORIES.map(({ color, name }) => {
    const count = totals.get(name) ?? 0;

    return (
      <div
        className="flex flex-col gap-0.5 border-separator border-b py-3"
        key={name}
      >
        <dt className="flex items-center gap-1.5 font-semibold text-muted text-xs">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-xs"
            style={{ backgroundColor: color }}
          />
          {name}
        </dt>
        <dd className="font-semibold text-xl tabular-nums">
          {formatCount(count)}
        </dd>
        <dd className="text-muted text-xs tabular-nums">
          {total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"}% of the month
        </dd>
      </div>
    );
  });
}

/**
 * The key numbers beside the page head: the four COE categories for the
 * selected month, then links to each figure. They sit in their own column of
 * the head grid, so on a wide page they start level with the title.
 */
export function DeregistrationsKeyNumbers({ report }: ReportProps) {
  return (
    <aside aria-label="Key numbers" className="flex flex-col gap-3">
      <Typography.Paragraph
        className="uppercase"
        color="muted"
        size="xs"
        weight="semibold"
      >
        Key numbers ·{" "}
        <Suspense fallback=" ">
          <ReportMonth report={report} />
        </Suspense>
      </Typography.Paragraph>
      {/* Four across, under the head or in its right half. */}
      <dl className="grid @3xl:grid-cols-4 grid-cols-2 gap-x-6 border-separator border-t">
        <Suspense
          fallback={<Skeleton className="col-span-full my-3 h-16 w-full" />}
        >
          <KeyNumberList report={report} />
        </Suspense>
      </dl>
      <nav aria-label="On this page">
        <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-sm">
          {JUMP_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a className="text-accent-strong no-underline" href={href}>
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
