import { Text } from "@heroui/react";
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
        <Text type="h1">{title}</Text>
        {badge}
      </div>
      {subtitle && <Text type="body">{subtitle}</Text>}
    </div>
  );
}
