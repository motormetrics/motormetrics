import { Button, Link, Skeleton } from "@heroui/react";
import { KPI, KPIGroup, TrendChip } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import { getLatestAndPreviousCoeResults } from "@web/queries/coe";
import { ArrowUpRight } from "lucide-react";
import { Fragment, Suspense } from "react";
import { calculateChangePercent, calculateTrend } from "./coe-trend-utils";

async function CoeSectionContent() {
  const { latest, previous } = await getLatestAndPreviousCoeResults();

  // Create a map of previous results by vehicle class for easy lookup
  const previousMap = new Map(previous.map((r) => [r.vehicleClass, r.premium]));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Typography.H3>Latest COE Results</Typography.H3>
        <Link href="/coe" aria-label="View all COE results">
          <Button isIconOnly variant="tertiary">
            <ArrowUpRight className="size-6" />
          </Button>
        </Link>
      </div>
      <KPIGroup>
        {latest.map((result, index) => {
          const previousPremium =
            previousMap.get(result.vehicleClass) ?? result.premium;
          const trend = calculateTrend(result.premium, previousPremium);
          const changePercent = calculateChangePercent(
            result.premium,
            previousPremium,
          );

          return (
            <Fragment key={result.vehicleClass}>
              {index > 0 ? <KPIGroup.Separator /> : null}
              <KPI>
                <KPI.Header>
                  <KPI.Title>{result.vehicleClass}</KPI.Title>
                </KPI.Header>
                <KPI.Content>
                  <KPI.Value
                    className="text-lg"
                    currency="SGD"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    style="currency"
                    value={result.premium}
                  />
                  {trend !== "neutral" ? (
                    <TrendChip
                      trend={trend === "up" ? "down" : "up"}
                      variant="primary"
                    >
                      {changePercent}
                    </TrendChip>
                  ) : null}
                </KPI.Content>
                {trend === "neutral" ? (
                  <KPI.Footer>
                    <span className="text-muted text-xs">{changePercent}</span>
                  </KPI.Footer>
                ) : null}
              </KPI>
            </Fragment>
          );
        })}
      </KPIGroup>
    </div>
  );
}

function CoeSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-6 w-40 rounded-lg" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-default p-4">
            <Skeleton className="mb-2 h-4 w-12 rounded-lg" />
            <Skeleton className="h-6 w-20 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CoeSection() {
  return (
    <Suspense fallback={<CoeSectionSkeleton />}>
      <CoeSectionContent />
    </Suspense>
  );
}
