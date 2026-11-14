"use client";

import { cn } from "@heroui/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import { useCoeOverview } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  CATEGORY_DESCRIPTIONS,
  COE_CATEGORIES,
  toCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  type CoeOverviewData,
  formatPercentChange,
  pqpFor,
} from "@web/app/(main)/(dashboard)/coe/components/overview-figures";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { SectionHead } from "@web/components/shared/overview";
import type { COECategory } from "@web/types";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";

/** "The Category A PQP for November is $129,883, up 0.9% on October." */
function pqpSentence(data: CoeOverviewData, category: COECategory) {
  const pqp = pqpFor(data, category);
  if (!pqp || !data.pqp) {
    return undefined;
  }

  const month = formatMonthName(data.pqp.month);
  const change =
    pqp.change !== undefined && data.pqp.previousMonth
      ? `, ${pqp.change < 0 ? "down" : "up"} ${Math.abs(pqp.change * 100).toFixed(1)}% on ${formatMonthName(data.pqp.previousMonth)}`
      : "";
  return `The ${category} PQP for ${month} is ${formatCurrency(pqp.rate)}${change}.`;
}

/**
 * The prevailing quota premium for Categories A to D as ruled tiles, the
 * selected category tinted. Category E has no PQP: an Open category COE
 * cannot be renewed.
 */
export function PqpTilesView({
  categoryKey,
  data,
}: {
  categoryKey: CategoryKey;
  data: CoeOverviewData;
}) {
  if (!data.pqp) {
    return null;
  }

  const selected = toCategory(categoryKey);
  const caption =
    selected === "Category E"
      ? `LTA publishes no PQP for Category E. ${pqpSentence(data, "Category A") ?? ""}`
      : pqpSentence(data, selected);
  const previousMonth = data.pqp.previousMonth;

  return (
    <div className="flex flex-col gap-4">
      <SectionHead
        caption={caption}
        eyebrow="COE renewal"
        link={{ href: "/coe/pqp", label: "PQP rates" }}
        title={`Prevailing quota premium, ${formatMonthLabel(data.pqp.month)}`}
      />
      <ul className="grid @3xl:grid-cols-4 @md:grid-cols-2 grid-cols-1 border-separator border-t">
        {COE_CATEGORIES.flatMap((category) => {
          const pqp = pqpFor(data, category);
          if (!pqp) {
            return [];
          }
          const isSelected = category === selected;
          return [
            <li
              className={cn(
                "flex flex-col gap-1 border-separator border-b px-3 py-3.5",
                isSelected && "border-accent border-b-2 bg-accent-soft",
              )}
              key={category}
            >
              <span className="font-semibold text-muted text-xs">
                {category} · {CATEGORY_DESCRIPTIONS[category]}
              </span>
              <span className="font-semibold text-xl tabular-nums">
                {formatCurrency(pqp.rate)}
              </span>
              <span className="text-muted-strong text-xs tabular-nums">
                {pqp.change !== undefined && previousMonth
                  ? `${formatPercentChange(pqp.change)} vs ${formatMonthName(previousMonth)} · `
                  : ""}
                {/* LTA charges half the PQP, rounded up, for a 5-year renewal. */}
                5-year {formatCurrency(Math.ceil(pqp.rate / 2))}
              </span>
            </li>,
          ];
        })}
      </ul>
    </div>
  );
}

/** The tiles with the category in the URL tinted; render inside `<Suspense>`. */
export function PqpTilesSelected({ data }: { data: CoeOverviewData }) {
  const { category } = useCoeOverview();

  return <PqpTilesView categoryKey={category} data={data} />;
}
