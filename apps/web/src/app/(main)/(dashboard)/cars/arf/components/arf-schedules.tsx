"use client";

import { ChartTooltip } from "@heroui-pro/react";
import { BarChart } from "@heroui-pro/react/bar-chart";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  ARF_SCHEDULES,
  calculateArf,
} from "@web/app/(main)/(dashboard)/cars/arf/components/arf-rates";
import { LegendItem } from "@web/app/(main)/(dashboard)/cars/parf/components/parf-comparison";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { compactCurrency } from "@web/utils/formatting/chart-axis";

/** One bar: a schedule's ARF on the entered OMV. */
interface ScheduleRow {
  [key: string]: number | string;
  color: string;
  label: string;
  other: number;
  selected: number;
  value: number;
}

/**
 * Figure 1: the ARF on the entered OMV under each schedule LTA has applied, on
 * one zero-based scale, with the selected schedule in the darker shade. The
 * pair to the PARF page's old-against-new comparison.
 */
export function ArfSchedules({
  omv,
  scheduleKey,
}: {
  omv: number;
  scheduleKey: string;
}) {
  // Each row fills one series, so the selected bar takes the darker colour.
  const rows: ScheduleRow[] = ARF_SCHEDULES.map(({ key, label, tiers }) => {
    const { total } = calculateArf(omv, tiers);
    const isSelected = key === scheduleKey;
    return {
      color: isSelected ? "var(--chart-1)" : "var(--chart-4)",
      label,
      other: isSelected ? 0 : total,
      selected: isSelected ? total : 0,
      value: total,
    };
  });
  const ticks = axisTicks([...rows.map(({ value }) => value), 1], {
    zero: true,
  });
  const [current, ...earlier] = rows;
  // "A $100,000 OMV pays $200,000 on the current tiers (From Feb 2023),
  // against $160,000 (Feb 2022 to Feb 2023) and $152,000 (Before Feb 2022)."
  const caption = `A ${formatCurrency(omv)} OMV pays ${formatCurrency(current.value)} on the current tiers (${current.label}), against ${earlier
    .map(({ label, value }) => `${formatCurrency(value)} (${label})`)
    .join(" and ")}.`;

  return (
    <section className="flex scroll-mt-20 flex-col gap-4" id="arf-schedules">
      <SectionHead
        caption={caption}
        eyebrow="Figure 1 · Current and earlier tiers"
        title="ARF on this OMV under each schedule"
        trailing={
          <>
            <LegendItem className="bg-chart-1" label="Selected schedule" />
            <LegendItem className="bg-chart-4" label="Other schedules" />
          </>
        }
      />
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
          dataKey="other"
          fill="var(--chart-4)"
          radius={[0, 2, 2, 0]}
          stackId="arf"
        />
        <BarChart.Bar
          barSize={18}
          dataKey="selected"
          fill="var(--chart-1)"
          radius={[0, 2, 2, 0]}
          stackId="arf"
        />
        <BarChart.Tooltip
          content={({ active, payload }) => {
            const row = payload?.[0]?.payload as ScheduleRow | undefined;
            if (!active || !row) {
              return null;
            }
            return (
              <ChartTooltip>
                <ChartTooltip.Header>{row.label}</ChartTooltip.Header>
                <ChartTooltip.Item>
                  <ChartTooltip.Indicator color={row.color} />
                  <ChartTooltip.Label>ARF</ChartTooltip.Label>
                  <ChartTooltip.Value>
                    {formatCurrency(row.value)}
                  </ChartTooltip.Value>
                </ChartTooltip.Item>
              </ChartTooltip>
            );
          }}
        />
      </BarChart>
      <SourceNote>
        Source: LTA · Bars start at $0 on a shared scale. Schedules are keyed to
        when the car&apos;s COE was obtained.
      </SourceNote>
    </section>
  );
}
