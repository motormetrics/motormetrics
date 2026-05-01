import { Card, cn } from "@heroui/react";
import { AnimatedNumber } from "@web/components/animated-number";
import { MetricsComparison } from "@web/components/metrics-comparison";
import Typography from "@web/components/typography";

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
    <Card className={cn(variantStyles[variant], className)}>
      <Card.Header>
        <Typography.H4>{title}</Typography.H4>
      </Card.Header>
      <Card.Content>
        <div
          className={cn(
            "font-semibold tabular-nums",
            variant === "hero"
              ? "text-5xl text-accent"
              : "text-4xl text-accent",
          )}
        >
          <AnimatedNumber value={value} />
        </div>
      </Card.Content>
      <Card.Footer>
        <MetricsComparison current={current} previousMonth={previousMonth} />
      </Card.Footer>
    </Card>
  );
}
