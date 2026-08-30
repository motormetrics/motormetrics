import { Skeleton, Tooltip, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NumberValue } from "@heroui-pro/react";
import { SurfaceCard } from "@web/components/shared/bento";
import { getTopMakesByYear, getYearlyRegistrations } from "@web/queries/cars";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

async function YearlyChartContent() {
  const yearlyData = await getYearlyRegistrations();
  const series = yearlyData.slice(-8);
  const maxTotal = series.reduce((max, d) => Math.max(max, d.total), 0) || 1;
  const latest = series.at(-1);

  return (
    <SurfaceCard>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Typography.Paragraph color="muted" size="sm">
            Yearly registrations
          </Typography.Paragraph>
          <span className="font-extrabold text-4xl tabular-nums tracking-tight">
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={latest?.total ?? 0}
            />
          </span>
          <Typography.Paragraph color="muted" size="sm">
            registered in {latest?.year ?? "—"}
          </Typography.Paragraph>
        </div>
        <Tooltip delay={300}>
          <Link
            aria-label="View annual registration data"
            className={buttonVariants({
              className: "size-11 rounded-full",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href="/cars/annual"
          >
            <ArrowUpRight className="size-6" />
          </Link>
          <Tooltip.Content>View annual registration data</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="flex h-[130px] items-end gap-2">
        {series.map((item, index, arr) => {
          const isLatest = index === arr.length - 1;
          return (
            <div
              className="flex h-full flex-1 flex-col justify-end gap-2"
              key={item.year}
            >
              <div
                className="w-full rounded-xl"
                style={{
                  height: `${(item.total / maxTotal) * 100}%`,
                  backgroundColor: isLatest
                    ? "var(--chart-1)"
                    : "color-mix(in oklab, var(--accent) 15%, transparent)",
                }}
              />
              <span
                className="text-center font-semibold text-xs"
                style={{
                  color: isLatest ? "var(--chart-1)" : "var(--muted)",
                }}
              >
                {item.year}
              </span>
            </div>
          );
        })}
      </div>
    </SurfaceCard>
  );
}

async function TopMakesContent() {
  const topMakes = await getTopMakesByYear();
  const maxValue = topMakes[0]?.value ?? 1;

  return (
    <SurfaceCard>
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typography.Paragraph color="muted" size="sm">
            Registrations
          </Typography.Paragraph>
          <Typography.Heading level={3}>Top makes</Typography.Heading>
        </div>
        <Tooltip delay={300}>
          <Link
            aria-label="View all car makes"
            className={buttonVariants({
              className: "size-11 rounded-full",
              isIconOnly: true,
              variant: "tertiary",
            })}
            href="/cars/makes"
          >
            <ArrowUpRight className="size-6" />
          </Link>
          <Tooltip.Content>View all car makes</Tooltip.Content>
        </Tooltip>
      </div>

      <div className="flex flex-col gap-4">
        {topMakes.slice(0, 5).map((item, index) => (
          <div className="flex flex-col gap-2" key={item.make}>
            <div className="flex items-center gap-4">
              <Typography.Paragraph color="muted" size="sm">
                {item.make}
              </Typography.Paragraph>
              <span className="ml-auto font-extrabold text-sm tabular-nums">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={item.value}
                />
              </span>
            </div>
            <div className="h-3.5 overflow-hidden rounded-full bg-default">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: `var(--chart-${index + 1})`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function YearlyChartSkeleton() {
  return (
    <SurfaceCard>
      <Skeleton className="h-6 w-40 rounded-lg" />
      <div className="flex h-[130px] items-end gap-2">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
          <div className="flex flex-1 flex-col gap-2" key={num}>
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-4 w-full rounded-lg" />
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

function TopMakesSkeleton() {
  return (
    <SurfaceCard>
      <Skeleton className="h-6 w-24 rounded-lg" />
      <div className="flex flex-col gap-4">
        {[0, 1, 2, 3, 4].map((num) => (
          <div className="flex flex-col gap-2" key={num}>
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-3.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    </SurfaceCard>
  );
}

export function YearlyChart() {
  return (
    <Suspense fallback={<YearlyChartSkeleton />}>
      <YearlyChartContent />
    </Suspense>
  );
}

export function TopMakesSection() {
  return (
    <Suspense fallback={<TopMakesSkeleton />}>
      <TopMakesContent />
    </Suspense>
  );
}

// Keep ChartsSection for backward compatibility but mark as deprecated
export function ChartsSection() {
  return (
    <>
      <YearlyChart />
      <TopMakesSection />
    </>
  );
}
