import { Button, Card, Link, Skeleton } from "@heroui/react";
import { KPI, TrendChip } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import { getLatestAndPreviousCoeResults } from "@web/queries/coe";
import { ArrowDownIcon, ArrowUpIcon, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import { calculateChangePercent, calculateTrend } from "./coe-trend-utils";

async function CoeSectionContent() {
  const { latest, previous } = await getLatestAndPreviousCoeResults();

  // Create a map of previous results by vehicle class for easy lookup
  const previousMap = new Map(previous.map((r) => [r.vehicleClass, r.premium]));

  return (
    <Card>
      <Card.Content>
        <div className="mb-5 flex items-center justify-between">
          <Typography.H3>Latest COE Results</Typography.H3>
          <Link href="/coe" aria-label="View all COE results">
            <Button isIconOnly variant="tertiary">
              <ArrowUpRight className="size-6" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {latest.map((result) => {
            const previousPremium =
              previousMap.get(result.vehicleClass) ?? result.premium;
            const trend = calculateTrend(result.premium, previousPremium);
            const changePercent = calculateChangePercent(
              result.premium,
              previousPremium,
            );

            return (
              <KPI key={result.vehicleClass}>
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
                  {trend !== "neutral" && (
                    <TrendChip
                      trend={trend === "up" ? "down" : "up"}
                      variant="primary"
                    >
                      <TrendChip.Indicator>
                        {trend === "up" ? <ArrowUpIcon /> : <ArrowDownIcon />}
                      </TrendChip.Indicator>
                      {changePercent}
                    </TrendChip>
                  )}
                </KPI.Content>
                {trend === "neutral" && (
                  <KPI.Footer>
                    <span className="text-muted text-xs">{changePercent}</span>
                  </KPI.Footer>
                )}
              </KPI>
            );
          })}
        </div>
      </Card.Content>
    </Card>
  );
}

function CoeSectionSkeleton() {
  return (
    <Card>
      <Card.Content>
        <Skeleton className="mb-5 h-6 w-40 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-default shadow-none">
              <Card.Content>
                <Skeleton className="mb-2 h-4 w-12 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-lg" />
              </Card.Content>
            </Card>
          ))}
        </div>
      </Card.Content>
    </Card>
  );
}

export function CoeSection() {
  return (
    <Suspense fallback={<CoeSectionSkeleton />}>
      <CoeSectionContent />
    </Suspense>
  );
}
