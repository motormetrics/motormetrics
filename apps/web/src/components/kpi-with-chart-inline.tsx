import { KPI, TrendChip } from "@heroui-pro/react";
import type { ComponentProps, ReactNode } from "react";

type KpiValueProps = Omit<
  ComponentProps<typeof KPI.Value>,
  "children" | "value"
>;

type KpiChartProps = Omit<ComponentProps<typeof KPI.Chart>, "color" | "data">;

interface KpiWithChartInlineProps {
  title: string;
  icon?: ReactNode;
  value: number;
  valueProps?: KpiValueProps;
  chartData: Record<string, number | string>[];
  chartColor?: string;
  chartProps?: KpiChartProps;
  trend?: {
    direction: ComponentProps<typeof TrendChip>["trend"];
    label: string;
    suffix?: string;
  };
}

export function KpiWithChartInline({
  title,
  icon,
  value,
  valueProps,
  chartData,
  chartColor = "var(--color-accent)",
  chartProps,
  trend,
}: KpiWithChartInlineProps) {
  const { className: valueClassName, ...restValueProps } = valueProps ?? {};
  const {
    height = 70,
    strokeWidth = 1.5,
    ...restChartProps
  } = chartProps ?? {};

  return (
    <KPI>
      <KPI.Header>
        {icon}
        <KPI.Title>{title}</KPI.Title>
      </KPI.Header>
      <KPI.Content className="grid-cols-[1fr_1fr] items-end">
        <div className="flex flex-col gap-1">
          <KPI.Value
            className={valueClassName ?? "text-3xl"}
            value={value}
            {...restValueProps}
          />
          {trend ? (
            <div className="flex items-center gap-1.5">
              <TrendChip trend={trend.direction} variant="tertiary">
                {trend.label}
                {trend.suffix ? (
                  <TrendChip.Suffix>{trend.suffix}</TrendChip.Suffix>
                ) : null}
              </TrendChip>
            </div>
          ) : null}
        </div>
        {chartData.length > 0 ? (
          <KPI.Chart
            color={chartColor}
            data={chartData}
            height={height}
            strokeWidth={strokeWidth}
            {...restChartProps}
          />
        ) : null}
      </KPI.Content>
    </KPI>
  );
}
