import { Card, cn, Text } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type HighlightStat = {
  label: string;
  value: ReactNode;
};

type HighlightStatsCardProps = {
  actionHref: string;
  actionLabel: string;
  className?: string;
  description?: ReactNode;
  label: string;
  stats: HighlightStat[];
  value: ReactNode;
};

export function HighlightStatsCard({
  actionHref,
  actionLabel,
  className,
  description,
  label,
  stats,
  value,
}: HighlightStatsCardProps) {
  return (
    <Card className={cn("bg-accent text-accent-foreground", className)}>
      <Card.Content className="relative gap-5">
        <div className="absolute inset-0 bg-[radial-gradient(currentColor_1px,transparent_1px)] bg-size-[18px_18px] opacity-20" />
        <div className="relative flex items-center justify-between gap-4">
          <div>
            <Text
              type="body-xs"
              color="muted"
              className="text-accent-foreground/70"
            >
              {label}
            </Text>
            <p className="font-semibold text-3xl">{value}</p>
            {description ? (
              <p className="text-accent-foreground/70 text-sm">{description}</p>
            ) : null}
          </div>
          <Link
            className={buttonVariants({
              className: "bg-accent-foreground text-accent",
              size: "sm",
              variant: "tertiary",
            })}
            href={actionHref}
          >
            {actionLabel}
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
        <div className="relative grid gap-3 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <span className="text-accent-foreground/70 text-xs">
                {stat.label}
              </span>
              <p className="font-medium text-lg">{stat.value}</p>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}
