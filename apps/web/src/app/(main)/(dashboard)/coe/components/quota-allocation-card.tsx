import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { SurfaceCard } from "@web/components/shared/bento";
import { getCoeResults } from "@web/queries/coe";
import type { SearchParams } from "nuqs/server";
import { CategorySelect } from "./coe-controls";
import {
  COE_CATEGORIES,
  formatExercise,
  groupByExercise,
  toCategory,
  toCategoryKey,
} from "./coe-exercise-utils";
import { loadCoeOverviewSearchParams } from "./search-params";

export async function QuotaAllocationCard({
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
  const rows = COE_CATEGORIES.map((category) => ({
    category,
    quota: latest.results[category]?.quota ?? 0,
  }));
  const largestQuota = Math.max(...rows.map((row) => row.quota), 1);

  return (
    <SurfaceCard className="gap-4">
      <div className="flex flex-col gap-1">
        <Typography.Paragraph color="muted">
          Quota allocation
        </Typography.Paragraph>
        <Typography.Heading level={3}>
          {formatExercise(latest)}
        </Typography.Heading>
      </div>

      <div className="flex flex-col gap-3">
        {rows.map((row) => {
          const isActive = row.category === selected;
          return (
            <CategorySelect
              category={toCategoryKey(row.category)}
              isActive={isActive}
              key={row.category}
              label={`Show ${row.category}`}
            >
              <div className="flex flex-col gap-[7px]">
                <div className="flex items-center gap-2.5">
                  <span
                    className={
                      isActive
                        ? "font-extrabold text-foreground text-sm"
                        : "font-semibold text-foreground/85 text-sm"
                    }
                  >
                    {row.category}
                  </span>
                  <span className="ml-auto font-extrabold text-sm tabular-nums">
                    <NumberValue
                      locale="en-SG"
                      maximumFractionDigits={0}
                      value={row.quota}
                    />
                  </span>
                </div>
                <span className="block h-2.5 overflow-hidden rounded-full bg-default">
                  <span
                    className="block h-full rounded-full transition-[width]"
                    style={{
                      background: isActive
                        ? "var(--accent)"
                        : "var(--accent-soft)",
                      width: `${(row.quota / largestQuota) * 100}%`,
                    }}
                  />
                </span>
              </div>
            </CategorySelect>
          );
        })}
      </div>

      <Typography.Paragraph color="muted" size="xs">
        COEs available in this bidding exercise
      </Typography.Paragraph>
    </SurfaceCard>
  );
}
