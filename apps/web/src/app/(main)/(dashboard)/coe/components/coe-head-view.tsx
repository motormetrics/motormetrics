"use client";

import { Button, Chip, cn, ProgressBar, Typography } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { useCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  changeRatio,
  toCategory,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  bidsPerCoe,
  type CoeOverviewData,
  categoryHistory,
  formatAmountChange,
  formatPercentChange,
  pqpFor,
  rangePosition,
} from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { formatMonthName } from "@web/utils/dates/format-month";

/** The short names on the key-number buttons. */
const SHORT_NAMES: Record<CategoryKey, string> = {
  A: "up to 1,600cc",
  B: "above 1,600cc",
  C: "goods vehicles",
  D: "motorcycles",
  E: "open",
};

const count = (value: number) => value.toLocaleString("en-SG");

interface ViewProps {
  categoryKey: CategoryKey;
  data: CoeOverviewData;
}

/**
 * Direction D's range hero for the selected category: the latest premium and
 * its change, where it sits between the low and high of the last 24
 * exercises, the PQP to renew, and the bids against the quota as the lead.
 */
export function CoeHeroView({ categoryKey, data }: ViewProps) {
  const category = toCategory(categoryKey);
  const figures = data.latest.results[category];
  const premium = figures?.premium ?? 0;
  const previousPremium = data.previous?.results[category]?.premium;
  const range = rangePosition(categoryHistory(data.history, category));
  const pqp = pqpFor(data, category);
  const pqpMonth = data.pqp ? formatMonthName(data.pqp.month) : undefined;
  const previousPqpMonth = data.pqp?.previousMonth
    ? formatMonthName(data.pqp.previousMonth)
    : undefined;

  return (
    <>
      <div className="flex max-w-xl flex-col gap-2.5 border-separator border-t pt-4">
        <Typography.Paragraph className="text-muted-strong">
          <span className="font-semibold text-foreground">{category}</span>
          {` · ${CATEGORY_DESCRIPTIONS[category]}`}
        </Typography.Paragraph>
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
          <span className="font-extrabold text-4xl tabular-nums leading-none tracking-tight lg:text-5xl">
            {formatCurrency(premium)}
          </span>
          {previousPremium ? (
            <Chip className="tabular-nums" color="accent" variant="soft">
              {`${formatPercentChange(changeRatio(premium, previousPremium))} · ${formatAmountChange(premium - previousPremium)}`}
            </Chip>
          ) : null}
        </div>
        {range ? (
          <ProgressBar
            aria-label={`Against the last ${data.history.length} exercises: low ${formatCurrency(range.low.premium)}, high ${formatCurrency(range.high.premium)}, now ${formatCurrency(range.latest.premium)}. ${range.where}.`}
            className="gap-2 pt-1"
            maxValue={range.high.premium}
            minValue={range.low.premium}
            size="sm"
            value={range.latest.premium}
          >
            <ProgressBar.Track className="col-span-full">
              <ProgressBar.Fill />
            </ProgressBar.Track>
            <span className="col-span-full flex justify-between gap-3 text-muted text-xs tabular-nums">
              <span>
                {data.history.length}-exercise low{" "}
                {formatCurrency(range.low.premium)}
              </span>
              <span className="font-semibold text-foreground">
                {range.where}
              </span>
              <span>High {formatCurrency(range.high.premium)}</span>
            </span>
          </ProgressBar>
        ) : null}
        <Typography.Paragraph
          className="text-muted-strong tabular-nums"
          size="sm"
        >
          {pqp && pqpMonth
            ? `PQP to renew a ${category} COE in ${pqpMonth}: ${formatCurrency(pqp.rate)}${pqp.change !== undefined && previousPqpMonth ? `, ${formatPercentChange(pqp.change)} on ${previousPqpMonth}` : ""}`
            : "LTA publishes no PQP for Category E"}
        </Typography.Paragraph>
      </div>
      <Typography.Paragraph className="max-w-prose text-lg tabular-nums">
        {figures
          ? `${count(figures.bidsReceived)} bids were made for ${count(figures.quota)} ${category} certificates, ${bidsPerCoe(figures)} per COE.`
          : null}
      </Typography.Paragraph>
    </>
  );
}

/** The hero for the category in the URL; render inside `<Suspense>`. */
export function CoeHeroSelected({ data }: { data: CoeOverviewData }) {
  const { category } = useCoeOverview();

  return <CoeHeroView categoryKey={category} data={data} />;
}

/**
 * The key numbers beside the head: one pressable figure per category, which
 * selects it for the whole page.
 */
export function CoeKeyNumbersView({
  categoryKey,
  data,
  onSelect,
}: ViewProps & { onSelect?: (category: CategoryKey) => void }) {
  return (
    // biome-ignore lint/a11y/useSemanticElements: a group of toggle buttons, not a form fieldset
    <div
      aria-label="Choose a category"
      className="grid @3xl:grid-cols-5 @7xl:grid-cols-2 grid-cols-2 border-separator border-t"
      role="group"
    >
      {COE_CATEGORIES.map((category) => {
        const key = toCategoryKey(category);
        const figures = data.latest.results[category];
        const premium = figures?.premium ?? 0;
        const previousPremium = data.previous?.results[category]?.premium;
        const pqp = pqpFor(data, category);
        const isPressed = key === categoryKey;

        return (
          <Button
            aria-pressed={isPressed}
            // A key number rather than an action: the Button keeps its press
            // and focus handling but drops its pill shape for D's ruled cell,
            // with the selected cell tinted and underlined in the accent.
            className={cn(
              "h-auto min-w-0 flex-col items-start justify-start gap-0.5 whitespace-normal rounded-none border-separator border-b px-2.5 py-3 text-left font-normal",
              isPressed && "border-accent border-b-2 bg-accent-soft",
            )}
            key={category}
            onPress={() => onSelect?.(key)}
            variant="ghost"
          >
            <span
              className={cn(
                "font-semibold text-xs",
                isPressed ? "text-accent-strong" : "text-muted",
              )}
            >
              {category} · {SHORT_NAMES[key]}
            </span>
            <span className="font-semibold text-foreground text-xl tabular-nums">
              {formatCurrency(premium)}
            </span>
            <span className="text-muted-strong text-xs tabular-nums">
              {previousPremium
                ? `${formatPercentChange(changeRatio(premium, previousPremium))} · `
                : ""}
              {bidsPerCoe(figures)} bids per COE
            </span>
            <span className="text-muted-strong text-xs tabular-nums">
              {pqp
                ? `PQP ${formatCurrency(pqp.rate)}${pqp.change !== undefined ? ` · ${formatPercentChange(pqp.change)}` : ""}`
                : "No PQP for Category E"}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

/** The key numbers with the category in the URL pressed; render inside `<Suspense>`. */
export function CoeKeyNumbersSelected({ data }: { data: CoeOverviewData }) {
  const { category, selectCategory } = useCoeOverview();

  return (
    <CoeKeyNumbersView
      categoryKey={category}
      data={data}
      onSelect={selectCategory}
    />
  );
}
