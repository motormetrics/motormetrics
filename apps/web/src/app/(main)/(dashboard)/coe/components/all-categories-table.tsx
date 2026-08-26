import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import { SurfaceCard } from "@web/components/shared/bento";
import Typography from "@web/components/typography";
import { ChevronRight } from "lucide-react";
import { CategorySelect } from "./coe-controls";
import type { CategoryKey } from "./search-params";

export interface CategoryRow {
  category: string;
  categoryKey: CategoryKey;
  changeRatio: number;
  description: string;
  premium: number;
  quota: number;
}

const COLUMNS: { align: "left" | "right"; label: string }[] = [
  { align: "left", label: "Category" },
  { align: "right", label: "Premium" },
  { align: "right", label: "Quota" },
  { align: "right", label: "Change" },
];

/**
 * Fixed numeric columns so every row lines up — each row is its own grid, so
 * `auto` tracks would size independently and stagger. Kept narrow enough that
 * the category name still fits in the two-column layout below `2xl`.
 */
const GRID =
  "grid grid-cols-[minmax(0,1fr)_5.5rem_4rem_4.75rem_1rem] gap-2 2xl:grid-cols-[minmax(0,1fr)_7rem_5rem_5.5rem_1.5rem] 2xl:gap-3";

/**
 * The five-category table, always in category order.
 *
 * There is nothing to sort: A to E is the order the scheme itself defines and
 * the order every published COE result is quoted in, and with five fixed rows
 * a reader compares them by looking rather than by re-ordering. Sortable
 * headers here only offered a way to lose that familiar sequence.
 *
 * The rows arrive already ordered, built from `COE_CATEGORIES`.
 */
export function AllCategoriesTable({
  exercise,
  rows,
  selected,
}: {
  exercise: string;
  rows: CategoryRow[];
  selected: CategoryKey;
}) {
  return (
    <SurfaceCard className="gap-4">
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex flex-col">
          <Typography.H3 className="font-bold text-2xl tracking-[-0.02em]">
            All categories
          </Typography.H3>
          <Typography.TextSm className="font-semibold text-muted">
            {exercise} · five categories
          </Typography.TextSm>
        </div>
      </div>

      <div className="flex flex-col">
        <div
          className={cn(
            GRID,
            "items-center border-separator border-b px-4 pt-4 pb-3",
          )}
        >
          {COLUMNS.map((column) => (
            <span
              className={cn(
                "font-bold text-[13px] text-muted uppercase tracking-[0.06em]",
                column.align === "right" ? "text-right" : "text-left",
              )}
              key={column.label}
            >
              {column.label}
            </span>
          ))}
          <span />
        </div>

        {rows.map((row) => {
          const isActive = row.categoryKey === selected;
          return (
            <CategorySelect
              category={row.categoryKey}
              className={cn(
                "rounded-field transition-colors",
                isActive ? "bg-accent/15" : "hover:bg-background",
              )}
              isActive={isActive}
              key={row.category}
              label={`Show ${row.category}`}
            >
              <div className={cn(GRID, "items-center px-4 py-3.5")}>
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-[38px] shrink-0 items-center justify-center rounded-full font-extrabold text-[15px]",
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "bg-accent/15 text-accent-strong",
                    )}
                  >
                    {row.categoryKey}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-bold text-base">
                      {row.category}
                    </span>
                    <span className="truncate font-medium text-[13px] text-muted">
                      {row.description}
                    </span>
                  </span>
                </span>
                <span className="text-right font-extrabold text-base tabular-nums">
                  <NumberValue
                    currency="SGD"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    style="currency"
                    value={row.premium}
                  />
                </span>
                <span className="text-right font-bold text-[15px] text-muted tabular-nums">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={row.quota}
                  />
                </span>
                <span className="flex justify-end">
                  <CostTrendChip changeRatio={row.changeRatio} />
                </span>
                <ChevronRight
                  aria-hidden
                  className="size-[18px] justify-self-end text-muted"
                />
              </div>
            </CategorySelect>
          );
        })}
      </div>

      <Typography.Caption className="px-4 font-medium text-muted">
        Premiums are the quota premium at the close of the exercise. Select a
        category for its bidding history.
      </Typography.Caption>
    </SurfaceCard>
  );
}
