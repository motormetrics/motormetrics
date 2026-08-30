import { cn, Typography } from "@heroui/react";
import { LastUpdated } from "@web/components/shared/last-updated";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  lastUpdated?: number | null;
}

export function PageHeader({
  title,
  subtitle,
  children,
  className,
  lastUpdated,
}: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
        <div className="flex flex-col">
          <Typography.Heading level={1}>{title}</Typography.Heading>
          {subtitle && (
            <Typography.Paragraph color="muted">
              {subtitle}
            </Typography.Paragraph>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          {!!lastUpdated && <LastUpdated lastUpdated={lastUpdated} />}
          {children}
        </div>
      </div>
    </div>
  );
}
