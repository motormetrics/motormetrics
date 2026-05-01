import { cn } from "@heroui/react";
import type { ReactNode } from "react";

interface DashboardPageHeaderProps {
  className?: string;
  meta?: ReactNode;
  title: ReactNode;
}

export function DashboardPageHeader({
  className,
  meta,
  title,
}: DashboardPageHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-col justify-between gap-2 lg:flex-row lg:items-center">
        {title}
        {meta}
      </div>
    </div>
  );
}
