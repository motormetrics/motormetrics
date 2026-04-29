import { formatCurrency } from "@motormetrics/utils";
import { numberFormat } from "@ruchernchong/number-format";
import type { CSSProperties, ReactNode } from "react";
import { Label, XAxis, YAxis } from "recharts";

interface CurrencyTooltipFormatterProps<T = number> {
  value: T;
  name: string | number;
  index: number;
}

export const currencyTooltipFormatter = <T extends number | string>({
  value,
  name,
  index,
}: CurrencyTooltipFormatterProps<T>): ReactNode => {
  const numericValue: number =
    typeof value === "string" ? Number.parseFloat(value) : value;

  return (
    <>
      <div
        className="size-2.5 shrink-0 rounded-[2px] bg-(--colour-bg)"
        style={
          {
            "--colour-bg": `var(--chart-${index + 1})`,
          } as CSSProperties
        }
      />
      {name}
      <div className="ml-auto flex items-baseline gap-1 font-medium text-foreground tabular-nums">
        {formatCurrency(numericValue)}
      </div>
    </>
  );
};

interface PriceYAxisProps {
  label?: string;
  hide?: boolean;
}

export function PriceYAxis({
  label = "Price ($)",
  hide = false,
}: PriceYAxisProps) {
  return (
    <YAxis
      domain={[
        (dataMin: number) => Math.floor(dataMin / 10000) * 10000,
        (dataMax: number) => Math.ceil(dataMax / 10000) * 10000,
      ]}
      tickFormatter={numberFormat}
      axisLine={false}
      hide={hide}
    >
      <Label
        value={label}
        angle={-90}
        position="insideLeft"
        style={{ textAnchor: "middle" }}
      />
    </YAxis>
  );
}

interface MonthXAxisProps {
  tickFormatter: (value: string) => string;
}

export function MonthXAxis({ tickFormatter }: MonthXAxisProps) {
  return (
    <XAxis dataKey="month" tickFormatter={tickFormatter} axisLine={false} />
  );
}
