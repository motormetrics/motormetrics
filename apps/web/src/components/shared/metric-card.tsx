import { Card, cn } from "@heroui/react";
import { CARD_VARIANTS, type CardVariant } from "@motormetrics/theme/spacing";
import { AnimatedNumber } from "@web/components/animated-number";
import { MetricsComparison } from "@web/components/metrics-comparison";
import Typography from "@web/components/typography";

interface MetricCardProps {
  title: string;
  value: number;
  current: number;
  previousMonth: number;
  /** Card styling variant */
  variant?: CardVariant;
  /** Additional className for the card */
  className?: string;
}

const variantStyles = {
  default: "p-3",
  hero: "p-6 border-l-4 border-primary",
  metric: "p-3",
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
    <Card
      className={cn(CARD_VARIANTS[variant], variantStyles[variant], className)}
    >
      <Card.Header>
        <Typography.H4>{title}</Typography.H4>
      </Card.Header>
      <Card.Content>
        <div
          className={cn(
            "font-semibold tabular-nums",
            variant === "hero"
              ? "text-5xl text-primary"
              : "text-4xl text-primary",
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
