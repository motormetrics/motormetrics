"use client";

import { Card, cn } from "@heroui/react";

import { BarChartByType } from "@web/app/(main)/(explore)/cars/registrations/bar-chart-by-type";
import Typography from "@web/components/typography";
import { FUEL_TYPE } from "@web/config";
import type { RegistrationStat } from "@web/types/cars";

type StatCardVariant = "default" | "hero" | "metric";

interface StatCardProps {
  title: string;
  description: string;
  data: RegistrationStat[];
  total: number;
  /** Card styling variant */
  variant?: StatCardVariant;
  /** Additional className for the card */
  className?: string;
}

export function StatCard({
  title,
  description,
  data,
  className,
}: StatCardProps) {
  return (
    <Card className={cn(className)}>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>{title}</Typography.H4>
        <Typography.TextSm>{description}</Typography.TextSm>
      </Card.Header>
      <Card.Content className="flex-1">
        <BarChartByType data={data} />
        {Object.keys(data).includes(FUEL_TYPE.OTHERS) && (
          <Typography.TextSm className="text-muted italic">
            Note: We do not know what is the Land Transport Authority&apos;s
            exact definition of &quot;Others&quot;.
          </Typography.TextSm>
        )}
      </Card.Content>
    </Card>
  );
}
