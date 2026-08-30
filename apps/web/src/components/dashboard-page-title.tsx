import { Typography } from "@heroui/react";
import type { ReactNode } from "react";

interface DashboardPageTitleProps {
  badge?: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardPageTitle({
  badge,
  title,
  subtitle,
}: DashboardPageTitleProps) {
  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2">
        <Typography.Heading level={1}>{title}</Typography.Heading>
        {badge}
      </div>
      {subtitle && (
        <Typography.Paragraph color="muted">{subtitle}</Typography.Paragraph>
      )}
    </div>
  );
}
