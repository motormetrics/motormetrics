import { Card, Chip } from "@heroui/react";
import Typography from "@web/components/typography";
import { getCategorySummaryByYear } from "@web/queries/cars";

export async function MarketOverview() {
  const summary = await getCategorySummaryByYear();

  return (
    <Card>
      <Card.Content className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Typography.H3>Market Overview</Typography.H3>
          <Chip color="accent" size="sm">
            {summary.year}
          </Chip>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card className="bg-default-100 shadow-none">
            <Card.Content className="p-4">
              <p className="text-default-500 text-sm">Total Cars</p>
              <p className="mt-1 font-bold text-2xl text-primary tabular-nums">
                {summary.total.toLocaleString()}
              </p>
            </Card.Content>
          </Card>
          <Card className="bg-default-100 shadow-none">
            <Card.Content className="p-4">
              <p className="text-default-500 text-sm">Electric</p>
              <p className="mt-1 font-bold text-2xl text-primary tabular-nums">
                {summary.electric.toLocaleString()}
              </p>
            </Card.Content>
          </Card>
          <Card className="bg-default-100 shadow-none">
            <Card.Content className="p-4">
              <p className="text-default-500 text-sm">Hybrid</p>
              <p className="mt-1 font-bold text-2xl text-primary tabular-nums">
                {summary.hybrid.toLocaleString()}
              </p>
            </Card.Content>
          </Card>
        </div>
      </Card.Content>
    </Card>
  );
}
