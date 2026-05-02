import { Button, Card, Chip, Link, Separator } from "@heroui/react";
import { AnimatedGrid } from "@web/app/(main)/(dashboard)/components/animated-grid";
import { AnimatedSection } from "@web/app/(main)/(dashboard)/components/animated-section";
import {
  calculateChangePercent,
  calculateTrend,
} from "@web/app/(main)/(dashboard)/components/coe-trend-utils";
import { HighlightStatsCard } from "@web/components/highlight-stats-card";
import Typography from "@web/components/typography";
import {
  getLatestAndPreviousCoeResults,
  getPQPOverview,
} from "@web/queries/coe";
import {
  ArrowUpRight,
  BarChart3,
  Calculator,
  CircleDollarSign,
  LineChart,
  TrendingUp,
} from "lucide-react";
import type { ReactNode } from "react";

const formatMonth = (month: string | null) => {
  if (!month) return "No data";

  return new Intl.DateTimeFormat("en-SG", {
    month: "short",
    year: "numeric",
  }).format(new Date(`${month}-01T00:00:00+08:00`));
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-SG", {
    currency: "SGD",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(value);

const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-SG").format(value);

const categoryLabel = (category: string) =>
  category.replace("Category ", "Cat ");

function TrendBadge({
  children,
  trend,
}: {
  children: ReactNode;
  trend: "up" | "down" | "neutral";
}) {
  return (
    <Chip
      color={
        trend === "up" ? "danger" : trend === "down" ? "success" : "default"
      }
      size="sm"
      variant="soft"
    >
      {children}
    </Chip>
  );
}

function PremiumRow({
  premium,
  previousPremium,
  quota,
  title,
}: {
  premium: number;
  previousPremium: number;
  quota: number;
  title: string;
}) {
  const trend = calculateTrend(premium, previousPremium);

  return (
    <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-2xl bg-background/10 p-3 text-background">
      <div className="flex size-10 items-center justify-center rounded-full bg-background/15 font-semibold text-sm">
        {title.replace("Category ", "")}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{title}</p>
        <p className="text-background/60 text-xs tabular-nums">
          {formatNumber(quota)} quota available
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="font-semibold text-lg tabular-nums">
          {formatCurrency(premium)}
        </span>
        <TrendBadge trend={trend}>
          {calculateChangePercent(premium, previousPremium)}
        </TrendBadge>
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
  icon: typeof BarChart3;
  label: string;
}) {
  return (
    <Link className="block no-underline" href={href}>
      <div className="flex items-center gap-3 rounded-2xl border border-separator bg-surface p-4 transition-colors hover:bg-default/50">
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

function MetricCard({
  label,
  meta,
  value,
}: {
  label: string;
  meta: string;
  value: string;
}) {
  return (
    <Card className="bg-surface/70 shadow-none">
      <Card.Content className="gap-3">
        <Typography.Caption>{label}</Typography.Caption>
        <span className="font-semibold text-2xl text-foreground tabular-nums">
          {value}
        </span>
        <span className="text-muted text-xs">{meta}</span>
      </Card.Content>
    </Card>
  );
}

export async function CoeOverview() {
  const [{ latest, previous }, pqpOverview] = await Promise.all([
    getLatestAndPreviousCoeResults(),
    getPQPOverview(),
  ]);

  const previousPremiums = new Map(
    previous.map((result) => [result.vehicleClass, result.premium]),
  );
  const latestRound = latest[0];
  const totalQuota = latest.reduce((total, result) => total + result.quota, 0);
  const totalBids = latest.reduce(
    (total, result) => total + result.bidsReceived,
    0,
  );
  const highestPremium = latest.reduce(
    (highest, result) => Math.max(highest, result.premium),
    0,
  );
  const highestCategory = latest.find(
    (result) => result.premium === highestPremium,
  )?.vehicleClass;
  const pressureRatio = totalQuota > 0 ? totalBids / totalQuota : 0;
  const pqpA = pqpOverview.categorySummaries.find(
    (item) => item.category === "Category A",
  );
  const pqpB = pqpOverview.categorySummaries.find(
    (item) => item.category === "Category B",
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Typography.H1>COE Overview</Typography.H1>
          <Typography.TextLg className="max-w-3xl text-muted">
            A high-level view of the latest bidding round, premium movement,
            demand pressure, and renewal benchmarks before you jump into the
            detailed COE pages.
          </Typography.TextLg>
        </div>
        <HighlightStatsCard
          actionHref="/coe/results"
          actionLabel="View results"
          description={`Round ${latestRound?.biddingNo ?? "-"} bidding desk`}
          label="Latest bidding round"
          stats={[
            {
              label: "Demand pressure",
              value: `${pressureRatio.toFixed(1)}x bids/quota`,
            },
            {
              label: "Highest premium",
              value: highestCategory ? categoryLabel(highestCategory) : "N/A",
            },
            { label: "PQP month", value: formatMonth(pqpOverview.latestMonth) },
          ]}
          value={formatMonth(latestRound?.month ?? null)}
        />
      </div>

      <AnimatedGrid className="grid grid-cols-12 gap-4">
        <AnimatedSection
          className="col-span-12 md:col-span-6 lg:col-span-3"
          order={0}
        >
          <MetricCard
            label="Total quota"
            meta="Latest bidding round"
            value={formatNumber(totalQuota)}
          />
        </AnimatedSection>
        <AnimatedSection
          className="col-span-12 md:col-span-6 lg:col-span-3"
          order={1}
        >
          <MetricCard
            label="Bids received"
            meta={`${pressureRatio.toFixed(1)}x quota pressure`}
            value={formatNumber(totalBids)}
          />
        </AnimatedSection>
        <AnimatedSection
          className="col-span-12 md:col-span-6 lg:col-span-3"
          order={2}
        >
          <MetricCard
            label="Highest premium"
            meta={
              highestCategory ? categoryLabel(highestCategory) : "Latest round"
            }
            value={formatCurrency(highestPremium)}
          />
        </AnimatedSection>
        <AnimatedSection
          className="col-span-12 md:col-span-6 lg:col-span-3"
          order={3}
        >
          <MetricCard
            label="PQP benchmark"
            meta="Category A renewal"
            value={formatCurrency(pqpA?.pqpRate ?? 0)}
          />
        </AnimatedSection>

        <AnimatedSection className="col-span-12 lg:col-span-8" order={4}>
          <Card className="h-full overflow-hidden bg-foreground text-background">
            <Card.Header className="relative flex-row items-start justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Card.Title className="text-background">
                  Premium Board
                </Card.Title>
                <Card.Description className="text-background/60">
                  Latest premiums, quota, and movement against the previous
                  round.
                </Card.Description>
              </div>
              <CircleDollarSign className="size-5 text-background/70" />
            </Card.Header>
            <Card.Content className="gap-3">
              {latest.map((result) => (
                <PremiumRow
                  key={result.vehicleClass}
                  premium={result.premium}
                  previousPremium={
                    previousPremiums.get(result.vehicleClass) ?? result.premium
                  }
                  quota={result.quota}
                  title={result.vehicleClass}
                />
              ))}
            </Card.Content>
          </Card>
        </AnimatedSection>

        <AnimatedSection className="col-span-12 lg:col-span-4" order={5}>
          <Card className="h-full">
            <Card.Header>
              <Card.Title>COE Detail Pages</Card.Title>
              <Card.Description>
                Use the overview to decide which data lens to open next.
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="flex flex-col gap-2 overflow-hidden">
                <OverviewLink
                  description="Latest premiums and quick insights"
                  href="/coe/premiums"
                  icon={BarChart3}
                  label="Premiums"
                />
                <Separator />
                <OverviewLink
                  description="Historical bidding rounds and trends"
                  href="/coe/results"
                  icon={TrendingUp}
                  label="Results"
                />
                <Separator />
                <OverviewLink
                  description="Renewal rates and PQP comparisons"
                  href="/coe/pqp"
                  icon={Calculator}
                  label="PQP Rates"
                />
              </div>
            </Card.Content>
          </Card>
        </AnimatedSection>

        <AnimatedSection className="col-span-12 lg:col-span-7" order={6}>
          <Card>
            <Card.Header>
              <Card.Title>Renewal Snapshot</Card.Title>
              <Card.Description>
                Current COE premiums compared with renewal benchmarks for the
                main passenger car categories.
              </Card.Description>
            </Card.Header>
            <Card.Content className="grid gap-4 sm:grid-cols-2">
              {[pqpA, pqpB].map((summary) => (
                <div
                  key={summary?.category ?? "empty"}
                  className="rounded-2xl bg-default p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Typography.Label>
                      {summary?.category ?? "N/A"}
                    </Typography.Label>
                    <TrendBadge
                      trend={
                        (summary?.difference ?? 0) > 0
                          ? "up"
                          : (summary?.difference ?? 0) < 0
                            ? "down"
                            : "neutral"
                      }
                    >
                      {(summary?.differencePercent ?? 0) > 0 ? "+" : ""}
                      {(summary?.differencePercent ?? 0).toFixed(1)}%
                    </TrendBadge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-4">
                    <div>
                      <span className="text-muted text-xs">Premium</span>
                      <p className="font-semibold text-lg tabular-nums">
                        {formatCurrency(summary?.coePremium ?? 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted text-xs">PQP</span>
                      <p className="font-semibold text-lg tabular-nums">
                        {formatCurrency(summary?.pqpRate ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </Card.Content>
          </Card>
        </AnimatedSection>

        <AnimatedSection className="col-span-12 lg:col-span-5" order={7}>
          <Card>
            <Card.Header>
              <Card.Title>How To Read This Category</Card.Title>
              <Card.Description>
                The overview shows the current state; the detailed pages answer
                progressively deeper questions.
              </Card.Description>
            </Card.Header>
            <Card.Content className="gap-4">
              {[
                [
                  "1",
                  "Start with premiums",
                  "What changed in the latest round?",
                ],
                ["2", "Check results", "How did categories move over time?"],
                ["3", "Compare PQP", "Is renewal cheaper than a fresh COE?"],
              ].map(([step, title, body]) => (
                <div key={step} className="flex gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent text-sm">
                    {step}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p className="text-muted text-sm">{body}</p>
                  </div>
                </div>
              ))}
              <Link className="no-underline" href="/coe/results">
                <Button className="w-fit rounded-full" variant="outline">
                  <LineChart className="size-4" />
                  Explore historical results
                </Button>
              </Link>
            </Card.Content>
          </Card>
        </AnimatedSection>
      </AnimatedGrid>
    </div>
  );
}
