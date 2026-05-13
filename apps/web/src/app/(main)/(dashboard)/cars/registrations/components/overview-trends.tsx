import { Card, Link, ProgressBar, Text } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils";
import { TrendChart } from "@web/app/(main)/(dashboard)/cars/registrations/trend-chart";

interface CarOverviewTrendsProps {
  cars: { make: string; count: number }[];
  total: number;
}

export function CarOverviewTrends({ cars, total }: CarOverviewTrendsProps) {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card>
        <Card.Header className="flex flex-col items-start gap-2">
          <Text type="h4">By Make</Text>
          <Text type="body-sm" color="muted">
            Top 10 makes
          </Text>
        </Card.Header>
        <Card.Content>
          <TrendChart data={cars} />
        </Card.Content>
      </Card>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <Card.Header className="flex flex-col items-start gap-2">
            <Text type="h4">Stats</Text>
            <Text type="body-sm" color="muted">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={total}
              />{" "}
              registrations
            </Text>
          </Card.Header>
          <Card.Content>
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
                      <NumberValue
                        locale="en-SG"
                        maximumFractionDigits={0}
                        value={count}
                      />
                      <ProgressBar
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
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
