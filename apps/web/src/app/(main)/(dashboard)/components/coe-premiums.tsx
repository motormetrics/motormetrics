"use client";

import { Typography } from "@heroui/react";
import { NumberValue, Segment } from "@heroui-pro/react";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { changeRatio } from "@web/utils/change-ratio";
import { formatMonthShortLabel } from "@web/utils/dates/format-month";
import posthog from "posthog-js";
import { useState } from "react";

export interface CoeCategorySeries {
  category: string;
  /** The letter on the category circle. */
  label: string;
  /** "Cars up to 1,600cc and 130bhp". */
  name: string;
  points: { month: string; premium: number }[];
}

const CHART_HEIGHT = 200;

/**
 * The left half of the COE section: the category switch, the latest premium for
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
      {/* The A–E switch and the category name share a row, which wraps on a
          phone too narrow for both. */}
      <div className="flex flex-wrap items-center gap-2">
        <Segment
          aria-label="COE category"
          onSelectionChange={(category) => {
            posthog.capture("dashboard_filter_changed", {
              filter: "category",
              value: category,
            });
            setSelected(String(category));
          }}
          selectedKey={active.category}
          size="md"
          variant="ghost"
        >
          {series.map((item) => (
            <Segment.Item id={item.category} key={item.category}>
              {item.label}
            </Segment.Item>
          ))}
        </Segment>
        <Typography.Paragraph
          className="sm:pl-2"
          weight="semibold"
          color="muted"
          size="sm"
        >
          {active.category} · {active.name}
        </Typography.Paragraph>
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
          data={active.points.map((point) => ({
            label: formatMonthShortLabel(point.month),
            value: point.premium,
          }))}
          format={{ currency: "SGD", style: "currency" }}
          height={CHART_HEIGHT}
          name="Premium"
          title={`${active.category} premiums over the last ${values.length} exercises`}
        />
        <div className="flex justify-between font-semibold text-muted text-xs">
          <span>{formatMonthShortLabel(active.points[0]?.month ?? "")}</span>
          <span>
            {formatMonthShortLabel(active.points.at(-1)?.month ?? "")}
          </span>
        </div>
      </div>
    </div>
  );
}
