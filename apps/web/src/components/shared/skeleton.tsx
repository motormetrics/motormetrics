import { Card, cn, Skeleton as HeroUISkeleton } from "@heroui/react";

interface SkeletonProps {
  className?: string;
}

// Base skeleton primitives
export function SkeletonCard({ className }: SkeletonProps) {
  return <HeroUISkeleton className={cn("h-32 w-full rounded-lg", className)} />;
}

export function SkeletonChart({ className }: SkeletonProps) {
  return <HeroUISkeleton className={cn("h-80 w-full rounded-lg", className)} />;
}

// Composed skeleton components for dashboard

/**
 * Bento card skeleton for dashboard grids
 */
export function SkeletonBentoCard({ className }: SkeletonProps) {
  return (
    <Card className={cn(className)}>
      <Card.Header className="flex flex-col items-start gap-2">
        <HeroUISkeleton className="h-6 w-40 rounded-lg" />
        <HeroUISkeleton className="h-4 w-full rounded-lg" />
      </Card.Header>
      <Card.Content className="flex flex-col gap-4">
        <HeroUISkeleton className="h-24 w-full rounded-lg" />
      </Card.Content>
    </Card>
  );
}

// Grid skeleton for card layouts
interface GridSkeletonProps {
  count: number;
  columns?: string;
  className?: string;
}

export function GridSkeleton({
  count,
  columns = "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5",
  className,
}: GridSkeletonProps) {
  return (
    <div className={cn("grid gap-4", columns, className)}>
      {Array.from({ length: count }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static placeholders
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// List skeleton for post/item lists
interface ListSkeletonProps {
  count: number;
  itemHeight?: string;
}

export function ListSkeleton({
  count,
  itemHeight = "h-20",
}: ListSkeletonProps) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <HeroUISkeleton
          // biome-ignore lint/suspicious/noArrayIndexKey: skeleton items are static placeholders
          key={i}
          className={cn("w-full rounded-lg", itemHeight)}
        />
      ))}
    </div>
  );
}
