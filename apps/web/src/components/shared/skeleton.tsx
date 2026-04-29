import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Skeleton as HeroUISkeleton } from "@heroui/skeleton";
import { cn } from "@heroui/theme";
import { RADIUS } from "@motormetrics/theme/spacing";

interface SkeletonProps {
  className?: string;
}

// Base skeleton primitives
export function SkeletonText({ className }: SkeletonProps) {
  return <HeroUISkeleton className={cn("h-4 w-full rounded-lg", className)} />;
}

export function SkeletonHeading({ className }: SkeletonProps) {
  return <HeroUISkeleton className={cn("h-8 w-48 rounded-lg", className)} />;
}

export function SkeletonCard({ className }: SkeletonProps) {
  return <HeroUISkeleton className={cn("h-32 w-full rounded-lg", className)} />;
}

export function SkeletonChart({ className }: SkeletonProps) {
  return <HeroUISkeleton className={cn("h-80 w-full rounded-lg", className)} />;
}

// Composed skeleton components for dashboard

/**
 * Metric card skeleton matching MetricCard layout
 */
export function SkeletonMetricCard() {
  return (
    <Card className={cn("p-3", RADIUS.card)}>
      <CardHeader>
        <HeroUISkeleton className="h-6 w-3/4 rounded-lg" />
      </CardHeader>
      <CardBody>
        <HeroUISkeleton className="h-10 w-32 rounded-lg" />
      </CardBody>
      <CardFooter>
        <HeroUISkeleton className="h-5 w-24 rounded-lg" />
      </CardFooter>
    </Card>
  );
}

/**
 * Chart widget skeleton matching ChartWidget layout
 */
export function SkeletonChartWidget({ className }: SkeletonProps) {
  return (
    <Card className={cn("p-3", RADIUS.card, className)}>
      <CardHeader>
        <HeroUISkeleton className="h-6 w-48 rounded-lg" />
      </CardHeader>
      <CardBody>
        <HeroUISkeleton className="h-64 w-full rounded-lg" />
      </CardBody>
    </Card>
  );
}

/**
 * Page header skeleton for loading states
 */
export function SkeletonPageHeader() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <HeroUISkeleton className="h-8 w-48 rounded-lg" />
        <HeroUISkeleton className="h-10 w-40 rounded-lg" />
      </div>
      <HeroUISkeleton className="h-5 w-32 rounded-lg" />
    </div>
  );
}

/**
 * Bento card skeleton for dashboard grids
 */
export function SkeletonBentoCard({ className }: SkeletonProps) {
  return (
    <Card className={cn("p-6", RADIUS.cardLarge, className)}>
      <CardHeader className="flex flex-col items-start gap-2">
        <HeroUISkeleton className="h-6 w-40 rounded-lg" />
        <HeroUISkeleton className="h-4 w-full rounded-lg" />
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        <HeroUISkeleton className="h-24 w-full rounded-lg" />
      </CardBody>
    </Card>
  );
}

// Composed section skeletons for Suspense fallbacks
interface SectionSkeletonProps {
  title?: boolean;
  children: React.ReactNode;
}

export function SectionSkeleton({
  title = true,
  children,
}: SectionSkeletonProps) {
  return (
    <section className="flex flex-col gap-4">
      {title && <SkeletonHeading />}
      {children}
    </section>
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
