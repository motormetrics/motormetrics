import { Button, Card, Link, ProgressBar } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils";
import { SkeletonBentoCard } from "@web/components/shared/skeleton";
import Typography from "@web/components/typography";
import { getLatestAndPreviousCoeResults, getPqpRates } from "@web/queries/coe";
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
      <Card>
        <Card.Header className="flex flex-col items-start gap-2">
          <Typography.H4>Category A vs B</Typography.H4>
          <Typography.TextSm>
            Will the premium quota of Category A ever surpass Category B?
          </Typography.TextSm>
        </Card.Header>
        <Card.Content>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <ProgressBar value={categoryAPercentage * 100} size="lg" />
              <div className="text-center">
                <span className="font-bold text-2xl text-accent">
                  <NumberValue
                    maximumFractionDigits={1}
                    style="percent"
                    value={categoryAPercentage}
                  />
                </span>
                <Typography.TextSm className="text-muted">
                  Category A is{" "}
                  <NumberValue
                    maximumFractionDigits={0}
                    style="percent"
                    value={categoryAPercentage}
                  />{" "}
                  of Category B
                </Typography.TextSm>
              </div>
            </div>
          </div>
        </Card.Content>
      </Card>

      {/* Latest PQP Rates Card */}
      <Card>
        <Card.Header className="flex flex-col items-start gap-2">
          <Typography.H4>Latest PQP Rates</Typography.H4>
          <Typography.TextSm>
            {latestPqpMonth &&
              `Prevailing Quota Premium for ${formatDateToMonthYear(latestPqpMonth)}`}
          </Typography.TextSm>
        </Card.Header>
        <Card.Content>
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
                  <Typography.TextSm className="text-muted">
                    {category}
                  </Typography.TextSm>
                  <span className="font-bold text-accent text-xl">
                    <NumberValue
                      currency="SGD"
                      locale="en-SG"
                      maximumFractionDigits={0}
                      style="currency"
                      value={rate}
                    />
                  </span>
                </div>
              ))}
          </div>
        </Card.Content>
        <Card.Footer className="flex-col items-start gap-2">
          <Typography.Caption>
            Note: There is no PQP for Category E
          </Typography.Caption>
          <Link href="/coe/pqp" className="w-full">
            <Button variant="primary" fullWidth>
              View All PQP Rates
            </Button>
          </Link>
        </Card.Footer>
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
