import { Badge } from "@heroui/badge";
import { Button } from "@heroui/button";
import { Card, CardBody } from "@heroui/card";
import { Link } from "@heroui/link";
import { Skeleton } from "@heroui/skeleton";
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
    <Badge
      aria-label={isUp ? "Price increased" : "Price decreased"}
      classNames={{
        base: "inline-flex",
        badge: "static h-5 min-w-5 translate-x-0 translate-y-0 border-0 p-0",
      }}
      color={isUp ? "danger" : "success"}
      content={<Icon aria-hidden className="size-3" />}
      shape="circle"
      showOutline={false}
      size="sm"
      variant="solid"
    >
      <span className="sr-only">
        {isUp ? "Price increased" : "Price decreased"}
      </span>
    </Badge>
  );
}

async function CoeSectionContent() {
  const { latest, previous } = await getLatestAndPreviousCoeResults();

  // Create a map of previous results by vehicle class for easy lookup
  const previousMap = new Map(previous.map((r) => [r.vehicleClass, r.premium]));

  return (
    <Card radius="lg">
      <CardBody className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <Typography.H3>Latest COE Results</Typography.H3>
          <Link href="/coe" aria-label="View all COE results">
            <Button isIconOnly variant="flat" radius="full" tabIndex={-1}>
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
                shadow="none"
                className="bg-muted"
              >
                <CardBody className="p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-default-500 text-xs">
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
                          : "text-default-500"
                    }`}
                  >
                    {changePercent}
                  </p>
                </CardBody>
              </Card>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}

function CoeSectionSkeleton() {
  return (
    <Card radius="lg">
      <CardBody className="p-6">
        <Skeleton className="mb-5 h-6 w-40 rounded-lg" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {[0, 1, 2, 3, 4].map((i) => (
            <Card key={i} shadow="none" className="bg-default-100">
              <CardBody className="p-4">
                <Skeleton className="mb-2 h-4 w-12 rounded-lg" />
                <Skeleton className="h-6 w-20 rounded-lg" />
              </CardBody>
            </Card>
          ))}
        </div>
      </CardBody>
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
