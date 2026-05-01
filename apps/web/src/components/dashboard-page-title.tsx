import Typography from "@web/components/typography";
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
        <Typography.H1>{title}</Typography.H1>
        {badge}
      </div>
      {subtitle && (
        <Typography.TextLg className="text-muted">{subtitle}</Typography.TextLg>
      )}
    </div>
  );
}
