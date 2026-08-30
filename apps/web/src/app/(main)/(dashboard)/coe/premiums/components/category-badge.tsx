import { cn } from "@heroui/react";

/**
 * The round CAT badge opening each row of the category tables on the two COE
 * report pages. `isActive` marks the category the premiums page is filtered to;
 * `/coe/results` has no category selection and leaves it off.
 */
export function CategoryBadge({
  categoryKey,
  isActive,
}: {
  categoryKey: string;
  isActive?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-full font-extrabold text-[1.0625rem]",
        isActive
          ? "bg-accent text-accent-foreground"
          : "bg-surface-secondary text-accent-strong",
      )}
    >
      {categoryKey}
    </span>
  );
}
