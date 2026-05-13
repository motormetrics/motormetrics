"use client";

import { Card, cn, Text } from "@heroui/react";

import { BarChartByType } from "@web/app/(main)/(dashboard)/cars/registrations/bar-chart-by-type";
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
        <Text type="h4">{title}</Text>
        <Text type="body-sm" color="muted">
          {description}
        </Text>
      </Card.Header>
      <Card.Content className="flex-1">
        <BarChartByType data={data} />
        {Object.keys(data).includes(FUEL_TYPE.OTHERS) && (
          <Text type="body-sm" color="muted">
            Note: We do not know what is the Land Transport Authority&apos;s
            exact definition of &quot;Others&quot;.
          </Text>
        )}
      </Card.Content>
    </Card>
  );
}
