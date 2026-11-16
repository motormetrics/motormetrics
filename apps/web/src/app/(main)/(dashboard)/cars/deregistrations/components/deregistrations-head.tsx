import { Skeleton, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  CATEGORIES,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/report-data";
import {
  leadSentence,
  rangeStats,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/summary";
import {
  KeyNumberGrid,
  KeyNumberItem,
  KeysAside,
} from "@web/components/shared/key-numbers";
import { RangeBar } from "@web/components/shared/range-bar";
import { RangeFigure, RangeHero } from "@web/components/shared/range-hero";
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
      <RangeFigure
        change={
          priorTotal > 0
            ? `${sign}${Math.abs((difference / priorTotal) * 100).toFixed(1)}% · ${sign}${formatCount(Math.abs(difference))}`
            : undefined
        }
        value={
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={total} />
        }
      />
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
    <RangeHero
      label={
        <>
          <span className="font-semibold text-foreground">
            Vehicles deregistered
          </span>{" "}
          · {/* A non-breaking space holds the line until the month arrives. */}
          <Suspense fallback=" ">
            <ReportMonth report={report} />
          </Suspense>
        </>
      }
    >
      <Suspense fallback={<Skeleton className="h-24 w-full" />}>
        <HeroFigures report={report} />
      </Suspense>
    </RangeHero>
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

async function CategoryKeyNumbers({ report }: ReportProps) {
  const { total, totals } = await report;

  return KEY_CATEGORIES.map(({ color, name }) => {
    const count = totals.get(name) ?? 0;

    return (
      <KeyNumberItem
        key={name}
        label={
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-xs"
              style={{ backgroundColor: color }}
            />
            {name}
          </span>
        }
        note={`${total > 0 ? ((count / total) * 100).toFixed(1) : "0.0"}% of the month`}
        value={formatCount(count)}
      />
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
    <KeysAside
      eyebrow={
        <>
          Key numbers ·{" "}
          <Suspense fallback=" ">
            <ReportMonth report={report} />
          </Suspense>
        </>
      }
      jump={JUMP_LINKS}
      label="Key numbers"
      source="Source: LTA via DataMall."
    >
      {/* Four across, under the head or in its right half. */}
      <KeyNumberGrid besideHead={4}>
        <Suspense
          fallback={<Skeleton className="col-span-full my-3 h-16 w-full" />}
        >
          <CategoryKeyNumbers report={report} />
        </Suspense>
      </KeyNumberGrid>
    </KeysAside>
  );
}
