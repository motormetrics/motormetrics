import { Button, Card, Link, Skeleton } from "@heroui/react";
import { AnimatedNumber } from "@web/components/animated-number";
import Typography from "@web/components/typography";
import { getLatestAndPreviousCoeResults } from "@web/queries/coe";
import { ArrowDownIcon, ArrowUpIcon, ArrowUpRight } from "lucide-react";
import { Suspense } from "react";
import {
  calculateChangePercent,
  calculateTrend,
  type Trend,
} from "./coe-trend-utils";

function TrendBadge({ trend }: { trend: Exclude<Trend, "neutral"> }) {
  const isUp = trend === "up";
  const Icon = isUp ? ArrowUpIcon : ArrowDownIcon;

  return (
    <span
      className={`inline-flex size-5 items-center justify-center rounded-full ${
        isUp
          ? "bg-danger text-danger-foreground"
          : "bg-success text-success-foreground"
      }`}
    >
      <Icon aria-hidden className="size-3" />
      <span className="sr-only">
        {isUp ? "Price increased" : "Price decreased"}
      </span>
    </span>
  );
}

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
              <Card
                key={result.vehicleClass}
                className="bg-surface shadow-none"
              >
                <Card.Content>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-muted text-xs">
                      {result.vehicleClass}
                    </span>
                    {trend !== "neutral" && <TrendBadge trend={trend} />}
                  </div>
                  <p className="font-bold text-foreground text-lg tabular-nums">
                    <AnimatedNumber value={result.premium} format="currency" />
                  </p>
                  <p
                    className={`mt-1 font-medium text-xs ${
                      trend === "up"
                        ? "text-danger"
                        : trend === "down"
                          ? "text-success"
                          : "text-muted"
                    }`}
                  >
                    {changePercent}
                  </p>
                </Card.Content>
              </Card>
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
