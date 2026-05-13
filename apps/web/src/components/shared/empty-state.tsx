import { Text } from "@heroui/react";
import { FileQuestion } from "lucide-react";
import type { ReactNode } from "react";
import {
  AnimatedEmptyStateWrapper,
  DefaultActions,
} from "./empty-state.client";

interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  showDefaultActions?: boolean;
  className?: string;
}

export function EmptyState({
  icon,
  title = "No Data Available",
  description = "The requested data could not be found. Please try a different selection.",
  actions,
  showDefaultActions = true,
  className,
}: EmptyStateProps) {
  const defaultIcon = (
    <div className="flex size-16 items-center justify-center rounded-2xl bg-default">
      <FileQuestion className="size-8 text-muted" />
    </div>
  );

  return (
    <AnimatedEmptyStateWrapper className={className}>
      {icon ?? defaultIcon}

      <div className="flex flex-col items-center gap-2 text-center">
        <Text type="h3">{title}</Text>
        <Text type="body-sm" color="muted">
          {description}
        </Text>
      </div>

      {actions ?? (showDefaultActions && <DefaultActions />)}
    </AnimatedEmptyStateWrapper>
  );
}
