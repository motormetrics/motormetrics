import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Typography from "@web/components/typography";
import { getCategorySummaryByYear } from "@web/queries/cars";

export async function MarketOverview() {
  const summary = await getCategorySummaryByYear();

  return (
    <Card radius="lg">
      <CardBody className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <Typography.H3>Market Overview</Typography.H3>
          <Chip color="primary" size="sm">
            {summary.year}
          </Chip>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card shadow="none" className="bg-default-100">
            <CardBody className="p-4">
              <p className="text-default-500 text-sm">Total Cars</p>
              <p className="mt-1 font-bold text-2xl text-primary tabular-nums">
                {summary.total.toLocaleString()}
              </p>
            </CardBody>
          </Card>
          <Card shadow="none" className="bg-default-100">
            <CardBody className="p-4">
              <p className="text-default-500 text-sm">Electric</p>
              <p className="mt-1 font-bold text-2xl text-primary tabular-nums">
                {summary.electric.toLocaleString()}
              </p>
            </CardBody>
          </Card>
          <Card shadow="none" className="bg-default-100">
            <CardBody className="p-4">
              <p className="text-default-500 text-sm">Hybrid</p>
              <p className="mt-1 font-bold text-2xl text-primary tabular-nums">
                {summary.hybrid.toLocaleString()}
              </p>
            </CardBody>
          </Card>
        </div>
      </CardBody>
    </Card>
  );
}
