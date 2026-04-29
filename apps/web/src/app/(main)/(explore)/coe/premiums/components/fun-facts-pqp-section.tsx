import { Button } from "@heroui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Progress } from "@heroui/progress";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { AnimatedNumber } from "@web/components/animated-number";
import { SkeletonBentoCard } from "@web/components/shared/skeleton";
import Typography from "@web/components/typography";
import { getLatestAndPreviousCoeResults, getPqpRates } from "@web/queries/coe";
import { formatPercent } from "@web/utils/charts";
import Link from "next/link";
import { Suspense } from "react";

async function FunFactsPqpContent() {
  const [{ latest: latestResults }, pqpRates] = await Promise.all([
    getLatestAndPreviousCoeResults(),
    getPqpRates(),
  ]);

  const categoryA =
    latestResults.find((result) => result.vehicleClass === "Category A")
      ?.premium || 0;
  const categoryB =
    latestResults.find((result) => result.vehicleClass === "Category B")
      ?.premium || 0;
  const categoryAPercentage = categoryB > 0 ? categoryA / categoryB : 0;

  const latestPqpData = Object.entries(pqpRates)[0];
  const latestPqpMonth = latestPqpData?.[0] ?? "";
  const latestPqpRates = latestPqpData?.[1] ?? {};

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Fun Facts Card */}
      <Card className="rounded-2xl p-3">
        <CardHeader className="flex flex-col items-start gap-2">
          <Typography.H4>Category A vs B</Typography.H4>
          <Typography.TextSm>
            Will the premium quota of Category A ever surpass Category B?
          </Typography.TextSm>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Progress value={categoryAPercentage * 100} size="lg" />
              <div className="text-center">
                <span className="font-bold text-2xl text-primary tabular-nums">
                  {formatPercent(categoryAPercentage, {
                    maximumFractionDigits: 1,
                  })}
                </span>
                <Typography.TextSm className="text-default-500">
                  Category A is{" "}
                  {formatPercent(categoryAPercentage, {
                    maximumFractionDigits: 0,
                  })}{" "}
                  of Category B
                </Typography.TextSm>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Latest PQP Rates Card */}
      <Card className="rounded-2xl p-3">
        <CardHeader className="flex flex-col items-start gap-2">
          <Typography.H4>Latest PQP Rates</Typography.H4>
          <Typography.TextSm>
            {latestPqpMonth &&
              `Prevailing Quota Premium for ${formatDateToMonthYear(latestPqpMonth)}`}
          </Typography.TextSm>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(latestPqpRates)
              .filter(([key]) =>
                [
                  "Category A",
                  "Category B",
                  "Category C",
                  "Category D",
                ].includes(key),
              )
              .map(([category, rate]) => (
                <div key={category} className="flex flex-col gap-1">
                  <Typography.TextSm className="text-default-500">
                    {category}
                  </Typography.TextSm>
                  <span className="font-bold text-primary text-xl tabular-nums">
                    <AnimatedNumber value={rate} format="currency" />
                  </span>
                </div>
              ))}
          </div>
        </CardBody>
        <CardFooter className="flex-col items-start gap-2">
          <Typography.Caption>
            Note: There is no PQP for Category E
          </Typography.Caption>
          <Link href="/coe/pqp" className="w-full">
            <Button color="primary" className="w-full rounded-full">
              View All PQP Rates
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

function FunFactsPqpSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <SkeletonBentoCard />
      <SkeletonBentoCard />
    </div>
  );
}

export function FunFactsPqpSection() {
  return (
    <Suspense fallback={<FunFactsPqpSkeleton />}>
      <FunFactsPqpContent />
    </Suspense>
  );
}
