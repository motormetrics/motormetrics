"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import type {
  AgeBracket,
  ParfResult,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

/** One bar of the old-against-new comparison. */
interface CompareRow {
  [key: string]: number | string;
  after: number;
  before: number;
  color: string;
  label: string;
  value: number;
}

/** A legend swatch and its label, for the figure heads. */
export function LegendItem({
  className,
  label,
}: {
  className: string;
  label: string;
}) {
  return (
    <span className="flex items-center gap-1.5 text-muted text-xs">
      <span aria-hidden className={`size-2.5 rounded-xs ${className}`} />
      {label}
    </span>
  );
}

/**
 * Figure 1: what the entered ARF returns under the old schedule and the new
 * one, as two bars on one zero-based scale.
 */
export function ParfComparison({
  arf,
  bracket,
  result,
}: {
  arf: number;
  bracket: AgeBracket;
  result: ParfResult;
}) {
  // Each row fills one series, so the two bars take different colours.
  const rows: CompareRow[] = [
    {
      after: 0,
      before: result.oldRebate,
      color: "var(--chart-4)",
      label: "Before Budget 2026",
      value: result.oldRebate,
    },
    {
      after: result.newRebate,
      before: 0,
      color: "var(--chart-1)",
      label: "After Budget 2026",
      value: result.newRebate,
    },
  ];
  const ticks = axisTicks([result.oldRebate, result.newRebate, 1], {
    zero: true,
  });

  return (
    <section className="flex scroll-mt-20 flex-col gap-4" id="parf-compare">
      <SectionHead
        caption={
          bracket.oldRate === 0
            ? "Neither schedule pays a rebate past 10 years."
            : `On these figures the new schedule returns ${formatCurrency(result.shortfall)} less than the old one: ${formatCurrency(result.newRebate)} against ${formatCurrency(result.oldRebate)}.`
        }
        eyebrow="Figure 1 · Old and new schedules"
        title="What this deregistration returns"
        trailing={
          <>
            <LegendItem className="bg-chart-4" label="Before Budget 2026" />
            <LegendItem className="bg-chart-1" label="After Budget 2026" />
          </>
        }
      />
      <SourceNote className="tabular-nums">
        {formatCurrency(arf)} ARF · {bracket.label}
      </SourceNote>
      <BarChart
        data={rows}
        height={rows.length * 56 + 28}
        layout="vertical"
        margin={{ bottom: 0, left: 0, right: 16, top: 0 }}
      >
        <BarChart.Grid horizontal={false} />
        <BarChart.XAxis
          domain={[0, ticks.at(-1) ?? "auto"]}
          tickFormatter={compactCurrency}
          ticks={ticks}
          type="number"
        />
        <BarChart.YAxis
          dataKey="label"
          tickMargin={8}
          type="category"
          width={160}
        />
        <BarChart.Bar
          barSize={18}
          dataKey="before"
          fill="var(--chart-4)"
          radius={[0, 2, 2, 0]}
          stackId="rebate"
        />
        <BarChart.Bar
          barSize={18}
          dataKey="after"
          fill="var(--chart-1)"
          radius={[0, 2, 2, 0]}
          stackId="rebate"
        />
        <BarChart.Tooltip
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as CompareRow | undefined;
            if (!active || !row) {
              return null;
            }
            return (
              <ChartTooltip>
                <ChartTooltip.Header>{row.label}</ChartTooltip.Header>
                <ChartTooltip.Item>
                  <ChartTooltip.Indicator color={row.color} />
                  <ChartTooltip.Label>PARF rebate</ChartTooltip.Label>
                  <ChartTooltip.Value>
                    {formatCurrency(row.value)}
                  </ChartTooltip.Value>
                </ChartTooltip.Item>
              </ChartTooltip>
            );
          }}
        />
      </BarChart>
      <SourceNote>Source: LTA · Bars start at $0 on a shared scale.</SourceNote>
    </section>
  );
}
