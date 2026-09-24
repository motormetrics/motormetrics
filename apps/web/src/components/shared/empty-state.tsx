import { cn, Typography } from "@heroui/react";
import { DefaultActions } from "@web/components/shared/empty-state.client";
import { fadeInUpVariants } from "@web/config/animations";
import { FileQuestion } from "lucide-react";
import * as motion from "motion/react-client";
import type { ReactNode } from "react";

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
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
      className={cn(
        "flex flex-col items-center justify-center gap-6 rounded-3xl bg-default/50 px-8 py-12",
        className,
      )}
    >
      {icon ?? defaultIcon}

      <div className="flex flex-col items-center gap-2 text-center">
        <Typography.Heading level={3}>{title}</Typography.Heading>
        <Typography.Paragraph color="muted" size="sm" className="max-w-sm">
          {description}
        </Typography.Paragraph>
      </div>

      {actions ?? (showDefaultActions && <DefaultActions />)}
    </motion.div>
  );
}
