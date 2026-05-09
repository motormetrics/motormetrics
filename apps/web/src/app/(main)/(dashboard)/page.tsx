import { Card, Chip, ProgressBar, Separator } from "@heroui/react";
import { KPI, KPIGroup, NumberValue, Segment } from "@heroui-pro/react";
import type { SelectPost } from "@motormetrics/database";
import { YearlyRegistrationsChart } from "@web/app/(main)/(dashboard)/components/yearly-registrations-chart";
import { MonthSelector } from "@web/components/shared/month-selector";
import { StructuredData } from "@web/components/structured-data";
import { LOGO_URL, SITE_TITLE, SITE_URL } from "@web/config";
import { SOCIAL_URLS } from "@web/config/socials";
import {
  getCarMarketShareData,
  getCarsLatestMonth,
  getCarsMonths,
  getCategorySummaryByYear,
  getTopMakesByYear,
  getYearlyRegistrations,
} from "@web/queries/cars";
import { getLatestAndPreviousCoeResults } from "@web/queries/coe";
import { getCarLogo } from "@web/queries/logos";
import { getRecentPosts } from "@web/queries/posts";
import type { COEResult } from "@web/types";
import { ArrowRight, CalendarClock, Database } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";
import { Fragment, type ReactNode } from "react";

export const metadata: Metadata = {
  title: "Singapore Car Registration & COE Trends | Latest Statistics",
  description:
    "Track Singapore car registration trends, COE bidding results, and automotive market insights. Latest data from Land Transport Authority (LTA) with interactive charts, EV and hybrid statistics, and AI-powered analysis.",
  keywords: [
    "Singapore car registration",
    "COE prices",
    "car trends Singapore",
    "vehicle statistics",
    "electric vehicles Singapore",
    "hybrid cars",
    "LTA data",
  ],
  openGraph: {
    title: "Singapore Car Registration & COE Trends",
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts and latest market insights.",
    type: "website",
    siteName: SITE_TITLE,
  },
  twitter: {
    card: "summary_large_image",
    title: "Singapore Car Registration & COE Trends",
    description:
      "Track Singapore car registration trends and COE bidding results with interactive charts.",
  },
  alternates: {
    canonical: "/",
  },
};

const webSiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_TITLE,
  url: SITE_URL,
  description:
    "Analysis of new car registration trends in Singapore. Insights on popular makes, fuel and vehicle types, COE bidding results, and market data.",
  publisher: {
    "@type": "Organization",
    name: SITE_TITLE,
    url: SITE_URL,
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/cars/makes?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
} as const;

const organisationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_TITLE,
  url: SITE_URL,
  logo: LOGO_URL,
  description:
    "A platform for exploring Singapore car registration statistics, COE bidding results, and market data.",
  sameAs: [SOCIAL_URLS.instagram, SOCIAL_URLS.telegram, SOCIAL_URLS.github],
} as const;

type Trend = "up" | "down" | "neutral";

type BreakdownItem = {
  count: number;
  name: string;
  share: number;
};

type MarketShareItem = {
  count: number;
  name: string;
  percentage: number;
};

interface PageProps {
  searchParams: Promise<SearchParams>;
}

const formatMonth = (month: string) => {
  const [year, monthNumber] = month.split("-");

  return new Date(Number(year), Number(monthNumber) - 1).toLocaleString(
    "en-SG",
    {
      month: "short",
      year: "numeric",
    },
  );
};

const calculateRatio = (current: number, previous: number) =>
  previous > 0 ? (current - previous) / previous : 0;

const getTrend = (ratio: number): Trend =>
  ratio > 0 ? "up" : ratio < 0 ? "down" : "neutral";

const formatPercentLabel = (ratio: number) =>
  new Intl.NumberFormat("en-SG", {
    maximumFractionDigits: 1,
    signDisplay: "exceptZero",
    style: "percent",
  }).format(ratio);

const getReadingTime = (post: SelectPost) => {
  const metadata = post.metadata as Record<string, unknown> | null;

  return typeof metadata?.readingTime === "number" ? metadata.readingTime : 5;
};

const getPostDate = (post: SelectPost) => post.publishedAt ?? post.createdAt;

const formatPostDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const toBreakdownItems = (items: readonly MarketShareItem[] = []) =>
  items.map((item) => ({
    count: item.count,
    name: item.name,
    share: item.percentage,
  }));

const getCoeCategoryLabel = (vehicleClass: COEResult["vehicleClass"]) =>
  vehicleClass.replace("Category ", "");

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const requestedMonth = typeof params.month === "string" ? params.month : null;
  const [
    latestMonth,
    months,
    yearlyData,
    topMakes,
    marketSummary,
    coeRounds,
    posts,
  ] = await Promise.all([
    getCarsLatestMonth(),
    getCarsMonths(),
    getYearlyRegistrations(),
    getTopMakesByYear(),
    getCategorySummaryByYear(),
    getLatestAndPreviousCoeResults(),
    getRecentPosts(3),
  ]);

  const monthOptions = months.map(({ month }) => month);
  const selectedMonth =
    requestedMonth && monthOptions.includes(requestedMonth)
      ? requestedMonth
      : latestMonth;
  const wasAdjusted = Boolean(
    requestedMonth && requestedMonth !== selectedMonth,
  );
  const [fuelTypes, vehicleTypes] = selectedMonth
    ? await Promise.all([
        getCarMarketShareData(selectedMonth, "fuelType"),
        getCarMarketShareData(selectedMonth, "vehicleType"),
      ])
    : [null, null];

  const displayMonth = selectedMonth ? formatMonth(selectedMonth) : "No data";
  const topMakeLogos = new Map(
    await Promise.all(
      topMakes.slice(0, 5).map(async (item) => {
        const logo = await getCarLogo(item.make);

        return [item.make, logo?.url || null] as const;
      }),
    ),
  );
  const previousCoeByClass = new Map(
    coeRounds.previous.map((result) => [result.vehicleClass, result]),
  );

  return (
    <>
      <StructuredData data={webSiteSchema} />
      <StructuredData data={organisationSchema} />
      <section className="flex flex-col gap-5">
        <QuickGlanceHeader
          description="A cleaned-up view of Singapore vehicle registrations, COE results, and market signals using the latest MotorMetrics data."
          displayMonth={displayMonth}
          latestMonth={latestMonth}
          months={monthOptions}
          wasAdjusted={wasAdjusted}
        />
        <div className="grid items-start gap-4 lg:grid-cols-12">
          <div className="lg:col-span-12">
            <CoeResultsWidget
              latest={coeRounds.latest}
              previousByClass={previousCoeByClass}
            />
          </div>
          <div className="lg:col-span-4">
            <TopMakesWidget
              logoUrls={topMakeLogos}
              topMakes={topMakes}
              year={marketSummary.year}
            />
          </div>
          <div className="lg:col-span-8">
            <RecentInsightsWidget posts={posts} />
          </div>
          <div className="lg:col-span-4">
            <RegistrationChartWidget yearlyData={yearlyData} />
          </div>
          <div className="lg:col-span-8">
            <MarketOverviewPanel
              fuelTypes={toBreakdownItems(fuelTypes?.data)}
              vehicleTypes={toBreakdownItems(vehicleTypes?.data)}
            />
          </div>
        </div>
      </section>
    </>
  );
}

function QuickGlanceHeader({
  description,
  displayMonth,
  latestMonth,
  months,
  wasAdjusted,
}: Readonly<{
  description: string;
  displayMonth: string;
  latestMonth: string | null;
  months: string[];
  wasAdjusted: boolean;
}>) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip color="accent" variant="soft">
            <CalendarClock className="size-3.5" />
            <Chip.Label>Updated {displayMonth}</Chip.Label>
          </Chip>
          <Chip color="success" variant="soft">
            <Database className="size-3.5" />
            <Chip.Label>Latest available data</Chip.Label>
          </Chip>
        </div>
        <h1 className="font-semibold text-4xl text-foreground tracking-tight md:text-5xl">
          Quick Glance
        </h1>
        <p className="max-w-2xl text-muted leading-7">{description}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        {latestMonth ? (
          <MonthSelector
            latestMonth={latestMonth}
            months={months}
            wasAdjusted={wasAdjusted}
          />
        ) : null}
        <Segment defaultSelectedKey="month">
          <Segment.Item id="month">Month</Segment.Item>
          <Segment.Item id="quarter">Quarter</Segment.Item>
          <Segment.Item id="year">Year</Segment.Item>
        </Segment>
      </div>
    </div>
  );
}

function CoeResultsWidget({
  latest,
  previousByClass,
}: Readonly<{
  latest: COEResult[];
  previousByClass: Map<COEResult["vehicleClass"], COEResult>;
}>) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Latest COE Results</Card.Title>
        <Card.Description>Price movement by category</Card.Description>
      </Card.Header>
      <Card.Content>
        {latest.length > 0 ? (
          <KPIGroup className="bg-transparent shadow-none">
            {latest.map((result, index) => {
              const previous = previousByClass.get(result.vehicleClass);
              const changeRatio = calculateRatio(
                result.premium,
                previous?.premium ?? 0,
              );
              const trend = getTrend(changeRatio);

              return (
                <Fragment key={result.vehicleClass}>
                  <KPI>
                    <KPI.Header>
                      <KPI.Icon status={trend === "up" ? "warning" : "success"}>
                        <span className="font-semibold text-xs">
                          {getCoeCategoryLabel(result.vehicleClass)}
                        </span>
                      </KPI.Icon>
                      <KPI.Title>{result.vehicleClass}</KPI.Title>
                    </KPI.Header>
                    <KPI.Content className="grid-cols-[minmax(0,1fr)_auto] items-center">
                      <KPI.Value
                        currency="SGD"
                        locale="en-SG"
                        maximumFractionDigits={0}
                        style="currency"
                        value={result.premium}
                      />
                      <KPI.Trend trend={trend}>
                        {formatPercentLabel(changeRatio)}
                      </KPI.Trend>
                    </KPI.Content>
                  </KPI>
                  {index < latest.length - 1 ? <KPIGroup.Separator /> : null}
                </Fragment>
              );
            })}
          </KPIGroup>
        ) : (
          <EmptyWidgetMessage>No COE results available.</EmptyWidgetMessage>
        )}
      </Card.Content>
    </Card>
  );
}

function CategoryBreakdownWidget({
  items,
  title,
}: Readonly<{
  items: readonly BreakdownItem[];
  title: string;
}>) {
  const topItem = items[0];

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h3 className="font-semibold text-base text-foreground">{title}</h3>
        <p className="text-muted text-xs">Selected month distribution</p>
      </div>
      {topItem ? (
        <div className="flex flex-col gap-3 border-border border-b pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 flex-col gap-1">
              <span className="text-muted text-xs uppercase tracking-wide">
                Leading Category
              </span>
              <span className="truncate font-semibold text-2xl text-foreground">
                {topItem.name}
              </span>
              <span className="text-muted text-xs">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={topItem.count}
                />{" "}
                registrations
              </span>
            </div>
            <div className="shrink-0 text-right font-semibold text-2xl text-foreground tabular-nums">
              {topItem.share.toFixed(1)}%
            </div>
          </div>
          <ProgressBar
            aria-label={`${topItem.name} leading category share`}
            maxValue={100}
            size="sm"
            value={topItem.share}
          >
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {items.length > 0 ? (
          items.slice(0, 5).map((item, index) => (
            <div
              className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-3"
              key={item.name}
            >
              <span className="text-muted text-sm tabular-nums">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-medium text-foreground text-sm">
                  {item.name}
                </span>
                <ProgressBar
                  aria-label={`${item.name} share progress`}
                  maxValue={100}
                  size="sm"
                  value={item.share}
                >
                  <ProgressBar.Track>
                    <ProgressBar.Fill />
                  </ProgressBar.Track>
                </ProgressBar>
              </div>
              <div className="flex flex-col items-end">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={item.count}
                />
                <span className="text-muted text-xs">
                  {item.share.toFixed(1)}%
                </span>
              </div>
            </div>
          ))
        ) : (
          <EmptyWidgetMessage>
            No {title.toLowerCase()} data available.
          </EmptyWidgetMessage>
        )}
      </div>
    </section>
  );
}

function TopMakesWidget({
  logoUrls,
  topMakes,
  year,
}: Readonly<{
  logoUrls: Map<string, string | null>;
  topMakes: readonly { make: string; value: number }[];
  year: number;
}>) {
  const maxValue = topMakes[0]?.value ?? 0;

  return (
    <Card>
      <Card.Header>
        <Card.Title>Top Makes</Card.Title>
        <Card.Description>{year} registrations</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="flex flex-col gap-2">
          {topMakes.length > 0 ? (
            topMakes.slice(0, 5).map((item) => {
              const logoUrl = logoUrls.get(item.make);

              return (
                <div
                  className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3"
                  key={item.make}
                >
                  <div className="flex size-8 items-center justify-center overflow-hidden rounded-full bg-background ring-1 ring-border">
                    {logoUrl ? (
                      <Image
                        alt={`${item.make} logo`}
                        className="object-contain p-1"
                        height={32}
                        src={logoUrl}
                        width={32}
                      />
                    ) : (
                      <span className="font-medium text-[10px] text-muted">
                        {item.make.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-col gap-1">
                    <span className="truncate font-medium text-foreground text-sm">
                      {item.make}
                    </span>
                    <ProgressBar
                      aria-label={`${item.make} registrations progress`}
                      maxValue={maxValue}
                      size="sm"
                      value={item.value}
                    >
                      <ProgressBar.Track>
                        <ProgressBar.Fill />
                      </ProgressBar.Track>
                    </ProgressBar>
                  </div>
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={item.value}
                  />
                </div>
              );
            })
          ) : (
            <EmptyWidgetMessage>No make data available.</EmptyWidgetMessage>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

function MarketOverviewPanel({
  fuelTypes,
  vehicleTypes,
}: Readonly<{
  fuelTypes: readonly BreakdownItem[];
  vehicleTypes: readonly BreakdownItem[];
}>) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Market Overview</Card.Title>
        <Card.Description>
          Registration mix and signals worth checking
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:items-start">
          <CategoryBreakdownWidget items={fuelTypes} title="Fuel Types" />
          <Separator className="lg:hidden" />
          <Separator className="hidden lg:block" orientation="vertical" />
          <CategoryBreakdownWidget items={vehicleTypes} title="Vehicle Types" />
        </div>
      </Card.Content>
    </Card>
  );
}

function RegistrationChartWidget({
  yearlyData,
}: Readonly<{
  yearlyData: readonly { total: number; year: number }[];
}>) {
  const chartData = yearlyData.slice(-6).map((item) => ({
    registrations: item.total,
    year: String(item.year),
  }));

  return (
    <Card>
      <Card.Header>
        <Card.Title>Yearly Registrations</Card.Title>
        <Card.Description>Registrations by year</Card.Description>
      </Card.Header>
      <Card.Content>
        {chartData.length > 0 ? (
          <YearlyRegistrationsChart data={chartData} />
        ) : (
          <EmptyWidgetMessage>
            No yearly registration data available.
          </EmptyWidgetMessage>
        )}
      </Card.Content>
    </Card>
  );
}

function RecentInsightsWidget({
  posts,
}: Readonly<{
  posts: SelectPost[];
}>) {
  return (
    <Card>
      <Card.Header>
        <Card.Title>Latest Blog Posts</Card.Title>
        <Card.Description>Recent analysis with hero images</Card.Description>
      </Card.Header>
      <Card.Content>
        <div className="grid gap-3 md:grid-cols-3">
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Link
                className="group overflow-hidden rounded-xl bg-surface-secondary no-underline transition-colors hover:bg-surface"
                href={`/blog/${post.slug}`}
                key={post.id}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {post.heroImage ? (
                    <Image
                      alt={post.title}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      src={post.heroImage}
                    />
                  ) : (
                    <div className="h-full bg-[linear-gradient(135deg,var(--accent),var(--chart-3)_48%,var(--surface-secondary))]" />
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-background/50 to-transparent" />
                  <Chip
                    className="absolute top-3 left-3"
                    color={index === 0 ? "accent" : "default"}
                    size="sm"
                    variant="soft"
                  >
                    {index === 0 ? "Latest" : (post.dataType ?? "Insights")}
                  </Chip>
                </div>
                <div className="flex flex-col gap-3 p-4">
                  <div className="flex items-center justify-between gap-2 text-muted text-xs">
                    <span>
                      {formatPostDate(getPostDate(post))} ·{" "}
                      {getReadingTime(post)} min read
                    </span>
                    <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </div>
                  <h2 className="line-clamp-2 font-semibold text-foreground text-sm leading-5">
                    {post.title}
                  </h2>
                  {post.excerpt ? (
                    <p className="line-clamp-2 text-muted text-xs leading-5">
                      {post.excerpt}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))
          ) : (
            <EmptyWidgetMessage>No recent posts available.</EmptyWidgetMessage>
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

function EmptyWidgetMessage({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="rounded-xl bg-surface-secondary p-4 text-center text-muted text-sm">
      {children}
    </div>
  );
}
