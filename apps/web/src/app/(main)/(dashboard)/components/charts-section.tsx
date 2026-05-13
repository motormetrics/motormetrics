import { Button, Card, Link, Skeleton, Text } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { getTopMakesByYear, getYearlyRegistrations } from "@web/queries/cars";
import { ArrowUpRight } from "lucide-react";
import { Suspense } from "react";

async function YearlyChartContent() {
  const yearlyData = await getYearlyRegistrations();
  const maxTotal = yearlyData.reduce((max, d) => Math.max(max, d.total), 0);

  return (
    <Card>
      <Card.Content>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <Text type="h3">Yearly Registrations</Text>
            <p className="text-muted text-sm">
              Total registrations over the years
            </p>
          </div>
          <Link href="/cars/annual">
            <Button isIconOnly variant="tertiary">
              <ArrowUpRight className="size-6" />
            </Button>
          </Link>
        </div>
        <div className="flex h-[160px] items-end gap-4">
          {yearlyData.slice(-6).map((item, i, arr) => {
            const height = (item.total / maxTotal) * 140;
            const isLatest = i === arr.length - 1;
            return (
              <div
                key={item.year}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <span className="font-medium text-muted text-xs">
                  <NumberValue
                    maximumFractionDigits={1}
                    notation="compact"
                    value={item.total}
                  />
                </span>
                <div
                  className={`w-full rounded-t-xl transition-colors ${isLatest ? "bg-[var(--chart-1)]" : "bg-default hover:bg-default"}`}
                  style={{ height: `${height}px` }}
                />
                <span className="text-muted text-xs">{item.year}</span>
              </div>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}

async function TopMakesContent() {
  const topMakes = await getTopMakesByYear();
  const maxValue = topMakes[0]?.value ?? 1;

  return (
    <Card>
      <Card.Content>
        <div className="mb-5 flex items-center justify-between">
          <Text type="h3">Top Makes</Text>
          <Link href="/cars/makes">
            <Button isIconOnly variant="tertiary">
              <ArrowUpRight className="size-6" />
            </Button>
          </Link>
        </div>
        <div className="flex flex-col gap-4">
          {topMakes.slice(0, 5).map((item, i) => (
            <div key={item.make} className="flex items-center gap-4">
              <span className="w-5 font-medium text-muted text-sm">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-sm">{item.make}</span>
                  <span className="text-muted text-xs">
                    <NumberValue
                      locale="en-SG"
                      maximumFractionDigits={0}
                      value={item.value}
                    />
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-default">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.value / maxValue) * 100}%`,
                      backgroundColor: `var(--chart-${i + 1})`,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function YearlyChartSkeleton() {
  return (
    <Card>
      <Card.Content>
        <Skeleton className="mb-5 h-6 w-40 rounded-lg" />
        <div className="flex h-[160px] items-end gap-4">
          {[0, 1, 2, 3, 4, 5].map((num) => (
            <div key={num} className="flex flex-1 flex-col items-center gap-2">
              <Skeleton className="h-4 w-8 rounded-lg" />
              <Skeleton className="w-full rounded-t-xl" />
              <Skeleton className="h-4 w-8 rounded-lg" />
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

function TopMakesSkeleton() {
  return (
    <Card>
      <Card.Content>
        <Skeleton className="mb-5 h-6 w-24 rounded-lg" />
        <div className="flex flex-col gap-4">
          {[0, 1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center gap-4">
              <Skeleton className="h-5 w-5 rounded-lg" />
              <div className="flex-1">
                <Skeleton className="mb-1 h-4 w-20 rounded-lg" />
                <Skeleton className="h-1.5 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </Card.Content>
    </Card>
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
