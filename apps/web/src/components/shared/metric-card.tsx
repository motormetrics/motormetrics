import { cn } from "@heroui/react";
import { KPI } from "@heroui-pro/react";
import { MetricsComparison } from "@web/components/metrics-comparison";

type MetricCardVariant = "default" | "hero" | "metric";

interface MetricCardProps {
  title: string;
  value: number;
  current: number;
  previousMonth: number;
  /** Card styling variant */
  variant?: MetricCardVariant;
  /** Additional className for the card */
  className?: string;
}

const variantStyles = {
  default: "",
  hero: "border-l-4 border-accent",
  metric: "transition-shadow hover:shadow-sm",
} as const;

export function MetricCard({
  title,
  value,
  current,
  previousMonth,
  variant = "default",
  className,
}: MetricCardProps) {
  return (
    <KPI className={cn(variantStyles[variant], className)}>
      <KPI.Header>
        <KPI.Title>{title}</KPI.Title>
      </KPI.Header>
      <KPI.Content>
        <KPI.Value
          className={cn(
            "text-accent",
            variant === "hero" ? "text-5xl" : "text-4xl",
          )}
          locale="en-SG"
          maximumFractionDigits={0}
          value={value}
        />
      </KPI.Content>
      <KPI.Footer>
        <MetricsComparison current={current} previousMonth={previousMonth} />
      </KPI.Footer>
    </KPI>
  );
}
