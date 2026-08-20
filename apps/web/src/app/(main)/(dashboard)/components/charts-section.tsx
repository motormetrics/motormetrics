import { Card, Link, Tooltip } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NumberValue } from "@heroui-pro/react";
import { BonesFallback } from "@web/components/shared/bones-fallback";
import { BonesCapture } from "@web/components/shared/bones-skeleton";
import Typography from "@web/components/typography";
import { getTopMakesByYear, getYearlyRegistrations } from "@web/queries/cars";
import { ArrowUpRight } from "lucide-react";
import { Suspense } from "react";

async function YearlyChartContent() {
  const yearlyData = await getYearlyRegistrations();
  const maxTotal = yearlyData.reduce((max, d) => Math.max(max, d.total), 0);

  return (
    <BonesCapture name="yearly-chart">
      <Card>
        <Card.Content>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <Typography.H3>Yearly Registrations</Typography.H3>
              <p className="text-muted text-sm">
                Total registrations over the years
              </p>
            </div>
            <Tooltip delay={300}>
              <Link
                aria-label="View annual registration data"
                className={buttonVariants({
                  className: "size-10",
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
          <div className="flex h-[160px] items-end gap-4">
            {yearlyData.slice(-6).map((item, i, arr) => {
              const height = (item.total / maxTotal) * 140;
              const isLatest = i === arr.length - 1;
              return (
                <div
                  key={item.year}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="font-medium text-muted text-xs tabular-nums">
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
    </BonesCapture>
  );
}

async function TopMakesContent() {
  const topMakes = await getTopMakesByYear();
  const maxValue = topMakes[0]?.value ?? 1;

  return (
    <BonesCapture name="top-makes">
      <Card>
        <Card.Content>
          <div className="mb-5 flex items-center justify-between">
            <Typography.H3>Top Makes</Typography.H3>
            <Tooltip delay={300}>
              <Link
                aria-label="View all car makes"
                className={buttonVariants({
                  className: "size-10",
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
            {topMakes.slice(0, 5).map((item, i) => (
              <div key={item.make} className="flex items-center gap-4">
                <span className="w-5 font-medium text-muted text-sm">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="font-medium text-sm">{item.make}</span>
                    <span className="text-muted text-xs tabular-nums">
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
    </BonesCapture>
  );
}

export function YearlyChart() {
  return (
    <Suspense fallback={<BonesFallback name="yearly-chart" />}>
      <YearlyChartContent />
    </Suspense>
  );
}

export function TopMakesSection() {
  return (
    <Suspense fallback={<BonesFallback name="top-makes" />}>
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
