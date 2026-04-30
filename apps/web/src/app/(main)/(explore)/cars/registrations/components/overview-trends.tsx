import { Card, CardBody, CardHeader } from "@heroui/card";
import { Link } from "@heroui/link";
import { Progress } from "@heroui/progress";
import { slugify } from "@motormetrics/utils";
import { TrendChart } from "@web/app/(main)/(explore)/cars/registrations/trend-chart";
import { AnimatedNumber } from "@web/components/animated-number";
import Typography from "@web/components/typography";

interface CarOverviewTrendsProps {
  cars: { make: string; count: number }[];
  total: number;
}

export function CarOverviewTrends({ cars, total }: CarOverviewTrendsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="p-3">
        <CardHeader className="flex flex-col items-start gap-2">
          <Typography.H4>By Make</Typography.H4>
          <Typography.TextSm>Top 10 makes</Typography.TextSm>
        </CardHeader>
        <CardBody>
          <TrendChart data={cars} />
        </CardBody>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-3">
          <CardHeader className="flex flex-col items-start gap-2">
            <Typography.H4>Stats</Typography.H4>
            <Typography.TextSm>
              <Typography.Label>{total}</Typography.Label> registrations
            </Typography.TextSm>
          </CardHeader>
          <CardBody>
            {cars.length > 0 &&
              cars.map(({ make, count }) => {
                const marketShare = (count: number) => count / total;

                return (
                  <div
                    key={make}
                    className="flex items-center justify-between border-b py-2"
                  >
                    <Link href={`/cars/makes/${slugify(make)}`}>{make}</Link>
                    <div className="flex items-center gap-2">
                      <AnimatedNumber value={count} />
                      <Progress
                        aria-label={`${make} market share`}
                        className="w-32"
                        maxValue={1}
                        size="sm"
                        value={marketShare(count)}
                      />
                    </div>
                  </div>
                );
              })}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
