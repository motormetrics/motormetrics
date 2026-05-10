import { NumberValue, TrendChip } from "@heroui-pro/react";

interface StatsCompareProps {
  current: number;
  previousMonth: number;
}

interface TrendIndicatorProps {
  change: number;
  label: string;
}

const TrendIndicator = ({ change, label }: TrendIndicatorProps) => {
  const trend = change > 0 ? "up" : change < 0 ? "down" : "neutral";

  return (
    <div className="flex items-center gap-2">
      <TrendChip trend={trend} variant="primary">
        <NumberValue
          maximumFractionDigits={1}
          style="percent"
          value={Math.abs(change)}
        />
      </TrendChip>
      <span className="text-muted text-sm">{label}</span>
    </div>
  );
};

export function MetricsComparison({
  current,
  previousMonth,
}: StatsCompareProps) {
  const monthChange =
    previousMonth > 0 ? (current - previousMonth) / previousMonth : 0;

  return <TrendIndicator change={monthChange} label="vs last month" />;
}
