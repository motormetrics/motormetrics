import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CategoryTabs } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  CATEGORY_DESCRIPTIONS,
  formatPremiumChange,
  groupByExercise,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";
import type { ReactNode } from "react";

/**
 * One cell of a ruled two-column stat grid: a small label, the figure and a
 * muted note. Odd cells sit flush left; even cells carry the vertical rule.
 */
export function StatCell({
  label,
  note,
  value,
}: {
  label: string;
  note: ReactNode;
  value: ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-[3px] border-separator border-b py-3.5 pr-4 even:border-l even:pl-4">
      <Typography.Paragraph className="font-semibold text-xs" color="muted">
        {label}
      </Typography.Paragraph>
      <span className="font-semibold text-[22px] tabular-nums tracking-[-0.01em]">
        {value}
      </span>
      <Typography.Paragraph className="text-xs tabular-nums" color="muted">
        {note}
      </Typography.Paragraph>
    </div>
  );
}

/**
 * The opening block of /coe: the category switch, the selected category's
 * latest premium with its change on the previous exercise, and a ruled grid
 * of that exercise's figures. Stacks into one column at 900px and below.
 */
export async function CoeHeadline({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category: categoryKey }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);

  const exercises = groupByExercise(results);
  const latest = exercises.at(-1);
  const previous = exercises.at(-2);

  if (!latest) {
    return null;
  }

  const category = toCategory(categoryKey);
  const figures = latest.results[category];
  const premium = figures?.premium ?? 0;
  const previousPremium = previous?.results[category]?.premium;
  const oversubscription = figures?.quota
    ? figures.bidsReceived / figures.quota
    : 0;

  return (
    <div className="grid gap-5 min-[901px]:grid-cols-[1.15fr_1fr] min-[901px]:items-end min-[901px]:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <CategoryTabs selected={categoryKey} />
        <Typography.Paragraph className="text-[15px] text-muted-strong">
          <span className="font-semibold text-accent-strong">{category}</span>
          {` · ${CATEGORY_DESCRIPTIONS[category]}`}
        </Typography.Paragraph>
        <span className="font-extrabold text-[46px] tabular-nums leading-[0.95] tracking-[-0.03em] min-[721px]:text-[60px]">
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={premium}
          />
        </span>
        <Typography.Paragraph
          className="text-[15px] tabular-nums"
          color="muted"
        >
          {formatPremiumChange(
            premium,
            previous && previousPremium !== undefined
              ? { ...previous, premium: previousPremium }
              : undefined,
          )}
        </Typography.Paragraph>
      </div>

      <div className="grid grid-cols-2 border-separator border-t">
        <StatCell
          label="Quota"
          note="COEs available"
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={figures?.quota ?? 0}
            />
          }
        />
        <StatCell
          label="Bids received"
          note={`${oversubscription.toFixed(2)}× oversubscribed`}
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={figures?.bidsReceived ?? 0}
            />
          }
        />
      </div>
    </div>
  );
}
