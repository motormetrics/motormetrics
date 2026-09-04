"use client";

import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import { changeRatio } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import posthog from "posthog-js";
import { useState } from "react";

export interface CoeCategorySeries {
  category: string;
  /** The letter on the category circle. */
  label: string;
  /** "Cars up to 1600cc & 130bhp". */
  name: string;
  points: { month: string; premium: number }[];
}

const CHART_WIDTH = 700;
const CHART_HEIGHT = 200;

const formatMonth = (month: string) => {
  const [year, monthPart] = month.split("-");
  return new Date(Number(year), Number(monthPart) - 1).toLocaleString("en-SG", {
    month: "short",
    year: "numeric",
  });
};

/**
 * The left half of the COE section: category circles, the latest premium for
 * the chosen category and its trend. A client island only for the selection —
 * every series arrives computed from the server.
 */
export function CoePremiums({ series }: { series: CoeCategorySeries[] }) {
  const [selected, setSelected] = useState(series[0]?.category ?? "");
  const active = series.find((item) => item.category === selected) ?? series[0];

  if (!active) {
    return null;
  }

  const values = active.points.map((point) => point.premium);
  const current = values.at(-1) ?? 0;
  const previous = values.at(-2);

  return (
    <div className="flex flex-col gap-3.5">
      {/* Five 44px circles plus their gaps want 252px, which a 320px phone can
          give this row but not with the name beside them — so it wraps. */}
      <div className="flex flex-wrap items-center gap-2">
        {series.map((item) => {
          const isActive = item.category === active.category;
          return (
            <button
              aria-pressed={isActive}
              className={cn(
                "size-11 rounded-full font-extrabold text-base transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "bg-default text-muted-strong hover:bg-accent-soft",
              )}
              key={item.category}
              onClick={() => {
                posthog.capture("dashboard_filter_changed", {
                  filter: "category",
                  value: item.category,
                });
                setSelected(item.category);
              }}
              type="button"
            >
              {item.label}
            </button>
          );
        })}
        <span className="font-semibold text-[15px] text-muted sm:pl-2">
          {active.category} · {active.name}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3.5">
        <span className="font-extrabold text-5xl tabular-nums tracking-tight lg:text-[60px]">
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={current}
          />
        </span>
        <CostTrendChip changeRatio={changeRatio(current, previous)} />
      </div>

      <div className="flex flex-col gap-2">
        <SparklineChart
          height={CHART_HEIGHT}
          title={`${active.category} premiums over the last ${values.length} exercises`}
          values={values}
          width={CHART_WIDTH}
        />
        <div className="flex justify-between font-semibold text-muted text-xs">
          <span>{formatMonth(active.points[0]?.month ?? "")}</span>
          <span>{formatMonth(active.points.at(-1)?.month ?? "")}</span>
        </div>
      </div>
    </div>
  );
}
