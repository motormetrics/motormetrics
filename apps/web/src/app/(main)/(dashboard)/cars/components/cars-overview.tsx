import { Button, Card, Link, Separator } from "@heroui/react";
import { KPI, KPIGroup } from "@heroui-pro/react";
import { AnimatedGrid } from "@web/app/(main)/(dashboard)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import { HighlightStatsCard } from "@web/components/highlight-stats-card";
import Typography from "@web/components/typography";
import {
  getCarsComparison,
  getCarsData,
  getCarsLatestMonth,
  getCategorySummaryByYear,
  getEvLatestSummary,
  getTopMakes,
  getTopTypes,
} from "@web/queries/cars";
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  Calendar,
  Car,
  CarFront,
  DollarSign,
  FileMinus,
  FilePlus,
  Fuel,
  Zap,
} from "lucide-react";

const formatMonth = (month: string | null) => {
  if (!month) return "No data";

  return new Intl.DateTimeFormat("en-SG", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${month}-01T00:00:00+08:00`));
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-SG").format(value);

const getChangePercent = (current: number, previous: number) => {
  if (previous <= 0) return 0;

  return ((current - previous) / previous) * 100;
};

const getTrend = (value: number) => {
  if (value > 0) return "up" as const;
  if (value < 0) return "down" as const;
  return "neutral" as const;
};

function MarketBar({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="truncate font-medium text-foreground">{label}</span>
        <span className="text-muted tabular-nums">{formatNumber(value)}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-default">
        <div
          className="h-full rounded-full bg-accent"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function OverviewLink({
  description,
  href,
  icon: Icon,
  label,
}: {
  description: string;
  href: string;
  icon: typeof FilePlus;
  label: string;
}) {
  return (
    <Link className="block no-underline" href={href}>
      <div className="flex h-full items-center gap-3 rounded-2xl border border-separator bg-surface p-4 transition-colors hover:bg-default/50">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-default text-foreground">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground text-sm">
            {label}
          </p>
          <p className="truncate text-muted text-xs">{description}</p>
        </div>
        <div className="shrink-0">
          <ArrowUpRight className="size-4 text-muted" />
        </div>
      </div>
    </Link>
  );
}

export async function CarsOverview() {
  const latestMonth = await getCarsLatestMonth();
  const [
    currentData,
    comparison,
    topTypes,
    topMakes,
    evSummary,
    yearlySummary,
  ] = latestMonth
    ? await Promise.all([
        getCarsData(latestMonth),
        getCarsComparison(latestMonth),
        getTopTypes(latestMonth),
        getTopMakes(latestMonth),
        getEvLatestSummary(),
        getCategorySummaryByYear(),
      ])
    : [null, null, null, [], null, await getCategorySummaryByYear()];

  const monthlyChange = comparison
    ? getChangePercent(
        comparison.currentMonth.total,
        comparison.previousMonth.total,
      )
    : 0;
  const topMake = topMakes[0];
  const topFuelType = topTypes?.topFuelType.name ?? "N/A";
  const topVehicleType = topTypes?.topVehicleType.name ?? "N/A";

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Typography.H1>Cars Overview</Typography.H1>
          <Typography.TextLg className="max-w-3xl text-muted">
            A high-level read of Singapore vehicle registrations, market mix,
            lifecycle movement, and ownership tools. Use this page to orient
            yourself before drilling into the detailed datasets.
          </Typography.TextLg>
        </div>
        <HighlightStatsCard
          actionHref="/cars/registrations"
          actionLabel="View registrations"
          label="Latest registration month"
          stats={[
            { label: "Top make", value: topMake?.make ?? "N/A" },
            { label: "Top fuel", value: topFuelType },
            { label: "Top type", value: topVehicleType },
          ]}
          value={formatMonth(latestMonth)}
        />
      </div>

      <AnimatedGrid className="grid grid-cols-12 gap-4">
        <AnimatedSection className="col-span-12" order={0}>
          <KPIGroup>
            <KPI>
              <KPI.Header>
                <KPI.Title>Latest registrations</KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <KPI.Value
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={currentData?.total ?? 0}
                />
                <KPI.Trend trend={getTrend(monthlyChange)} variant="primary">
                  {monthlyChange > 0 ? "+" : ""}
                  {monthlyChange.toFixed(1)}%
                </KPI.Trend>
              </KPI.Content>
              <KPI.Footer>
                <span className="text-muted text-xs">
                  {formatMonth(latestMonth)}
                </span>
              </KPI.Footer>
            </KPI>
            <KPIGroup.Separator />
            <KPI>
              <KPI.Header>
                <KPI.Title>EV and hybrid share</KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <KPI.Value
                  maximumFractionDigits={1}
                  style="percent"
                  value={(evSummary?.evSharePercent ?? 0) / 100}
                />
              </KPI.Content>
              <KPI.Footer>
                <span className="text-muted text-xs">
                  {evSummary
                    ? `Top EV make: ${evSummary.topMake}`
                    : "Latest EV mix"}
                </span>
              </KPI.Footer>
            </KPI>
            <KPIGroup.Separator />
            <KPI>
              <KPI.Header>
                <KPI.Title>Annual total</KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <KPI.Value
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={yearlySummary.total}
                />
              </KPI.Content>
              <KPI.Footer>
                <span className="text-muted text-xs">
                  {yearlySummary.year} registration volume
                </span>
              </KPI.Footer>
            </KPI>
            <KPIGroup.Separator />
            <KPI>
              <KPI.Header>
                <KPI.Title>Market leader</KPI.Title>
              </KPI.Header>
              <KPI.Content>
                <span className="font-semibold text-2xl tabular-nums">
                  {topMake?.make ?? "N/A"}
                </span>
              </KPI.Content>
              <KPI.Footer>
                <span className="text-muted text-xs">
                  {topMake
                    ? `${formatNumber(topMake.total)} registrations`
                    : "Latest month"}
                </span>
              </KPI.Footer>
            </KPI>
          </KPIGroup>
        </AnimatedSection>

        <AnimatedSection className="col-span-12 lg:col-span-7" order={4}>
          <Card className="h-full">
            <Card.Header className="flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Card.Title>Registration Pulse</Card.Title>
                <Card.Description>
                  Latest month volume and category mix at a glance.
                </Card.Description>
              </div>
              <FilePlus className="size-5 text-accent" />
            </Card.Header>
            <Card.Content className="gap-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-default p-4">
                  <span className="text-muted text-xs">Total</span>
                  <p className="font-semibold text-3xl text-accent tabular-nums">
                    {formatNumber(currentData?.total ?? 0)}
                  </p>
                </div>
                <div className="rounded-2xl bg-default p-4">
                  <span className="text-muted text-xs">Dominant fuel</span>
                  <p className="font-semibold text-xl">{topFuelType}</p>
                </div>
                <div className="rounded-2xl bg-default p-4">
                  <span className="text-muted text-xs">
                    Dominant vehicle type
                  </span>
                  <p className="font-semibold text-xl">{topVehicleType}</p>
                </div>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                <div className="flex flex-col gap-4">
                  <Typography.Label>Fuel mix</Typography.Label>
                  {(currentData?.fuelType ?? []).slice(0, 4).map((item) => (
                    <MarketBar
                      key={item.name}
                      label={item.name}
                      total={currentData?.total ?? 0}
                      value={item.count}
                    />
                  ))}
                </div>
                <div className="flex flex-col gap-4">
                  <Typography.Label>Vehicle type mix</Typography.Label>
                  {(currentData?.vehicleType ?? []).slice(0, 4).map((item) => (
                    <MarketBar
                      key={item.name}
                      label={item.name}
                      total={currentData?.total ?? 0}
                      value={item.count}
                    />
                  ))}
                </div>
              </div>
            </Card.Content>
          </Card>
        </AnimatedSection>

        <AnimatedSection className="col-span-12 lg:col-span-5" order={5}>
          <Card className="h-full">
            <Card.Header>
              <Card.Title>Where To Drill In</Card.Title>
              <Card.Description>
                Choose a detailed view based on the question you are answering.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-col gap-2 overflow-hidden">
                <OverviewLink
                  description="Monthly volume, mix, and comparisons"
                  href="/cars/registrations"
                  icon={BarChart3}
                  label="Registration trends"
                />
                <Separator />
                <OverviewLink
                  description="Brand rankings and make-specific pages"
                  href="/cars/makes"
                  icon={CarFront}
                  label="Makes and market share"
                />
                <Separator />
                <OverviewLink
                  description="BEV, PHEV, and hybrid adoption"
                  href="/cars/electric-vehicles"
                  icon={Zap}
                  label="Electric vehicle adoption"
                />
              </div>
            </Card.Content>
          </Card>
        </AnimatedSection>

        <AnimatedSection className="col-span-12 lg:col-span-6" order={6}>
          <Card>
            <Card.Header>
              <Card.Title>Market Composition</Card.Title>
              <Card.Description>
                Understand how registrations split by brand, fuel, and body
                type.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid gap-3 sm:grid-cols-3">
                <OverviewLink
                  description="Brand leaders"
                  href="/cars/makes"
                  icon={CarFront}
                  label="Makes"
                />
                <OverviewLink
                  description="Petrol, hybrid, EV"
                  href="/cars/fuel-types"
                  icon={Fuel}
                  label="Fuel Types"
                />
                <OverviewLink
                  description="SUV, saloon, hatchback"
                  href="/cars/vehicle-types"
                  icon={Car}
                  label="Vehicle Types"
                />
              </div>
            </Card.Content>
          </Card>
        </AnimatedSection>

        <AnimatedSection className="col-span-12 lg:col-span-6" order={7}>
          <Card>
            <Card.Header>
              <Card.Title>Lifecycle And Ownership</Card.Title>
              <Card.Description>
                Move from market inflow to population, exits, and ownership
                costs.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="grid gap-3 sm:grid-cols-3">
                <OverviewLink
                  description="Vehicle exits"
                  href="/cars/deregistrations"
                  icon={FileMinus}
                  label="Deregistrations"
                />
                <OverviewLink
                  description="Yearly population"
                  href="/cars/annual"
                  icon={Calendar}
                  label="Annual"
                />
                <OverviewLink
                  description="PARF estimate"
                  href="/cars/parf"
                  icon={Calculator}
                  label="PARF Calculator"
                />
              </div>
              <div className="pt-4">
                <Link className="no-underline" href="/cars/costs">
                  <Button className="rounded-full" variant="outline">
                    <DollarSign className="size-4" />
                    Explore car cost breakdown
                  </Button>
                </Link>
              </div>
            </Card.Content>
          </Card>
        </AnimatedSection>
      </AnimatedGrid>
    </div>
  );
}
