import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CategorySelect } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  COE_CATEGORIES,
  groupByExercise,
  toCategory,
  toCategoryKey,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { BarRow } from "@web/components/shared/bar-row";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";
import type { ReactNode } from "react";

function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <Typography.Paragraph className="font-semibold" color="muted" size="sm">
        {label}
      </Typography.Paragraph>
      <span className="font-extrabold text-[33px] tabular-nums leading-none tracking-tight">
        {value}
      </span>
    </div>
  );
}

/**
 * The right half of the opening grid: the selected category's quota, bids and
 * bids-per-COE, then how the exercise's quota is split across the categories.
 * Each bar selects its category.
 */
export async function QuotaAllocation({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [{ category: categoryKey }, results] = await Promise.all([
    loadCoeOverviewSearchParams(searchParams),
    getCoeResults(),
  ]);

  const latest = groupByExercise(results).at(-1);

  if (!latest) {
    return null;
  }

  const selected = toCategory(categoryKey);
  const figures = latest.results[selected];
  const bidsPerCoe = figures?.quota ? figures.bidsReceived / figures.quota : 0;

  const rows = COE_CATEGORIES.map((category) => ({
    category,
    quota: latest.results[category]?.quota ?? 0,
  }));
  const largestQuota = Math.max(...rows.map((row) => row.quota), 1);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-6">
        <Stat
          label="Quota"
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={figures?.quota ?? 0}
            />
          }
        />
        <Stat
          label="Bids received"
          value={
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={figures?.bidsReceived ?? 0}
            />
          }
        />
        <Stat label="Bids per COE" value={`${bidsPerCoe.toFixed(2)}x`} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Typography.Paragraph className="font-semibold text-muted-strong">
          Quota allocation
        </Typography.Paragraph>
        <Typography.Paragraph className="font-medium" color="muted" size="sm">
          COEs available in this bidding exercise
        </Typography.Paragraph>
      </div>

      <div className="flex flex-col gap-[13px]">
        {rows.map((row) => {
          const isActive = row.category === selected;
          return (
            <CategorySelect
              category={toCategoryKey(row.category)}
              isActive={isActive}
              key={row.category}
              label={`Show ${row.category}`}
            >
              <BarRow
                color={isActive ? "var(--chart-1)" : "var(--chart-5)"}
                isActive={isActive}
                label={row.category}
                share={(row.quota / largestQuota) * 100}
                value={
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={row.quota}
                  />
                }
              />
            </CategorySelect>
          );
        })}
      </div>
    </div>
  );
}
