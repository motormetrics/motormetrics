"use client";

import { Button, Chip, ScrollShadow, Surface } from "@heroui/react";
import {
  BarChart,
  KPI,
  KPIGroup,
  Navbar,
  NumberValue,
  Segment,
  TrendChip,
  Widget,
} from "@heroui-pro/react";
import { MonthSelector } from "@web/components/shared/month-selector";
import {
  ArrowRight,
  CalendarClock,
  Car,
  Database,
  Gauge,
  Menu,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

const navItems = ["Overview", "About", "Blog", "Learn"];

const carsRouteChips = [
  "New Registrations",
  "Makes",
  "Fuel Types",
  "Vehicle Types",
  "Electric Vehicles",
  "Annual",
] as const;

const marketData = [
  { coe: 94, month: "Jan", registrations: 420 },
  { coe: 98, month: "Feb", registrations: 510 },
  { coe: 91, month: "Mar", registrations: 460 },
  { coe: 105, month: "Apr", registrations: 540 },
  { coe: 112, month: "May", registrations: 590 },
  { coe: 109, month: "Jun", registrations: 620 },
];

const mockMonths = ["2026-03", "2026-02", "2026-01", "2025-12", "2025-11"];

const coeResults = [
  ["A", 123010, "+1.4%"],
  ["B", 105002, "+4.3%"],
  ["C", 74601, "+4.8%"],
  ["D", 9502, "+1.7%"],
  ["E", 125002, "+2.2%"],
] as const;

const topMakes = [
  ["BYD", 3239],
  ["TOYOTA", 1932],
  ["TESLA", 1515],
  ["MERCEDES BENZ", 856],
  ["BMW", 832],
] as const;

const fuelTypes = [
  ["Electric", 8646, 64.9],
  ["Petrol", 3274, 24.6],
  ["Hybrid", 946, 7.1],
  ["Diesel", 456, 3.4],
] as const;

const vehicleTypes = [
  ["Saloon", 7240, 54.3],
  ["SUV", 3188, 23.9],
  ["Hatchback", 1412, 10.6],
  ["MPV", 896, 6.7],
] as const;

const recentInsights = [
  {
    category: "EVs",
    description: "BYD and Tesla keep electric registrations dominant.",
    image:
      "linear-gradient(135deg, var(--accent), var(--chart-3) 48%, var(--surface-secondary))",
    meta: "30 Apr 2026 · 5 min read",
    title: "EV adoption surges to new highs",
  },
  {
    category: "COE",
    description: "Open category pricing is moving ahead of the pack.",
    image:
      "linear-gradient(135deg, var(--chart-1), var(--chart-4) 52%, var(--surface-secondary))",
    meta: "29 Apr 2026 · 4 min read",
    title: "COE Category E clears $125k",
  },
  {
    category: "Registrations",
    description: "Registrations slowed despite stronger EV share.",
    image:
      "linear-gradient(135deg, var(--chart-2), var(--accent) 46%, var(--surface-secondary))",
    meta: "28 Apr 2026 · 3 min read",
    title: "Private-car demand cools",
  },
] as const;

export default function RedesignMockupsPage() {
  return (
    <div className="flex flex-col gap-8 pb-16">
      <section className="relative overflow-hidden rounded-[2rem] bg-surface p-8 shadow-surface md:p-10">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent via-cyan-400 to-chart-3" />
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-end">
          <div className="flex flex-col gap-5">
            <Chip className="w-fit" color="accent" variant="soft">
              <Sparkles className="size-3.5" />
              <Chip.Label>HeroUI Pro-first redesign direction</Chip.Label>
            </Chip>
            <div className="flex flex-col gap-4">
              <h1 className="max-w-4xl text-balance font-semibold text-4xl text-foreground tracking-tight md:text-6xl">
                Current shell, Pro modules
              </h1>
              <p className="max-w-2xl text-lg text-muted leading-8">
                Keep the recognisable MotorMetrics shell and horizontal route
                chips, then upgrade the dashboard surface with HeroUI Pro
                widgets, KPI groups, charts, and trend chips.
              </p>
            </div>
          </div>

          <Surface
            className="flex flex-col gap-3 rounded-3xl p-4"
            variant="secondary"
          >
            {[
              ["Keep", "Top navbar, route chips, compact public dashboard"],
              ["Upgrade", "HeroUI Pro widgets instead of bespoke shells"],
              ["Next", "Apply this language to fuel and vehicle pages"],
            ].map(([label, description]) => (
              <div key={label} className="rounded-2xl bg-surface p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="font-medium text-foreground text-sm">
                    {label}
                  </div>
                </div>
                <div className="text-muted text-xs leading-5">
                  {description}
                </div>
              </div>
            ))}
          </Surface>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-2">
            <span className="font-medium text-accent text-sm">
              Chosen direction
            </span>
            <h2 className="font-semibold text-3xl text-foreground tracking-tight">
              Quick Glance with the existing MotorMetrics shell
            </h2>
            <p className="max-w-3xl text-muted leading-7">
              This mockup is now the single source of truth for the redesign:
              familiar navigation, sharper data modules, and fewer custom
              wrappers around the content.
            </p>
          </div>
          <Chip className="w-fit" color="accent" variant="soft">
            Preferred
          </Chip>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-background shadow-surface">
          <PolishedCurrentMockup />
        </div>
      </section>
    </div>
  );
}

function PublicNavbar() {
  return (
    <Navbar
      className="border-border/70 border-b bg-surface/90 backdrop-blur-xl"
      maxWidth="2xl"
    >
      <Navbar.Header>
        <Navbar.Brand>
          <div className="flex size-9 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
            <Car className="size-5" />
          </div>
          <span className="font-semibold text-foreground">MotorMetrics</span>
        </Navbar.Brand>
        <Navbar.Spacer />
        <Navbar.Content className="hidden md:flex">
          {navItems.map((item) => (
            <Navbar.Item href="#" isCurrent={item === "Overview"} key={item}>
              {item}
            </Navbar.Item>
          ))}
        </Navbar.Content>
        <Button aria-label="Search" isIconOnly variant="tertiary">
          <Search className="size-4" />
        </Button>
        <Button
          aria-label="Open menu"
          className="md:hidden"
          isIconOnly
          variant="tertiary"
        >
          <Menu className="size-4" />
        </Button>
      </Navbar.Header>
    </Navbar>
  );
}

function RouteChipNav() {
  const primaryItems = ["Overview", "Cars", "COE", "Deregistrations"];

  return (
    <div className="border-border/70 border-b bg-background/90 px-4 py-3 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3">
        <ScrollShadow hideScrollBar orientation="horizontal">
          <div className="flex gap-2">
            {primaryItems.map((item) => (
              <Button
                className="h-9 shrink-0 rounded-full px-4"
                key={item}
                size="sm"
                variant={item === "Cars" ? "primary" : "outline"}
              >
                {item}
              </Button>
            ))}
          </div>
        </ScrollShadow>
        <ScrollShadow hideScrollBar orientation="horizontal">
          <div className="flex gap-2 border-border border-t pt-3">
            {carsRouteChips.map((item) => (
              <Button
                className="h-8 shrink-0 rounded-full px-3"
                key={item}
                size="sm"
                variant={item === "New Registrations" ? "primary" : "outline"}
              >
                {item}
                {item === "Makes" || item === "Electric Vehicles" ? (
                  <Chip color="accent" size="sm" variant="soft">
                    New
                  </Chip>
                ) : null}
              </Button>
            ))}
          </div>
        </ScrollShadow>
      </div>
    </div>
  );
}

function QuickGlanceHeader({ description }: Readonly<{ description: string }>) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Chip color="accent" variant="soft">
            <CalendarClock className="size-3.5" />
            <Chip.Label>Updated Mar 2026</Chip.Label>
          </Chip>
          <Chip color="success" variant="soft">
            <Database className="size-3.5" />
            <Chip.Label>Latest available data</Chip.Label>
          </Chip>
        </div>
        <h3 className="font-semibold text-4xl text-foreground tracking-tight md:text-5xl">
          Quick Glance
        </h3>
        <p className="max-w-2xl text-muted leading-7">{description}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <MonthSelector months={mockMonths} latestMonth="2026-03" />
        <Segment defaultSelectedKey="month">
          <Segment.Item id="month">Month</Segment.Item>
          <Segment.Item id="quarter">Quarter</Segment.Item>
          <Segment.Item id="year">Year</Segment.Item>
        </Segment>
      </div>
    </div>
  );
}

function SignalKpis() {
  return (
    <KPIGroup className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <KPI>
        <KPI.Header>
          <KPI.Icon status="success">
            <Car />
          </KPI.Icon>
          <KPI.Title>Total Registrations</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value maximumFractionDigits={0} value={13322} />
          <KPI.Trend trend="down">-74.7%</KPI.Trend>
        </KPI.Content>
      </KPI>
      <KPI>
        <KPI.Header>
          <KPI.Icon status="success">
            <Car />
          </KPI.Icon>
          <KPI.Title>Top Make</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <span className="font-semibold text-3xl text-foreground">BYD</span>
          <KPI.Trend trend="up">3,239</KPI.Trend>
        </KPI.Content>
        <KPI.Footer>
          <span className="text-muted text-xs">registrations</span>
        </KPI.Footer>
      </KPI>
      <KPI>
        <KPI.Header>
          <KPI.Icon status="warning">
            <Gauge />
          </KPI.Icon>
          <KPI.Title>COE Cat B</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value
            currency="SGD"
            maximumFractionDigits={0}
            style="currency"
            value={105002}
          />
          <KPI.Trend trend="up">+4.3%</KPI.Trend>
        </KPI.Content>
      </KPI>
      <KPI>
        <KPI.Header>
          <KPI.Icon status="success">
            <Zap />
          </KPI.Icon>
          <KPI.Title>EV Share</KPI.Title>
        </KPI.Header>
        <KPI.Content>
          <KPI.Value maximumFractionDigits={1} style="percent" value={0.649} />
          <KPI.Trend trend="up">+3.6%</KPI.Trend>
        </KPI.Content>
      </KPI>
    </KPIGroup>
  );
}

function CoeResultsWidget() {
  return (
    <Widget className="h-full">
      <Widget.Header>
        <Widget.Title>Latest COE Results</Widget.Title>
        <Widget.Description>Price movement by category</Widget.Description>
      </Widget.Header>
      <Widget.Content className="grid gap-2 p-3">
        {coeResults.map(([category, price, change]) => (
          <div
            className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-xl bg-surface-secondary p-3"
            key={category}
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">
              {category}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-foreground text-sm">
                Category {category}
              </span>
              <span className="text-muted text-xs">Price increased</span>
            </div>
            <div className="flex flex-col items-end gap-1">
              <NumberValue
                currency="SGD"
                maximumFractionDigits={0}
                style="currency"
                value={price}
              />
              <TrendChip size="sm" trend="up" variant="soft">
                {change}
              </TrendChip>
            </div>
          </div>
        ))}
      </Widget.Content>
    </Widget>
  );
}

function CategoryBreakdownWidget({
  items,
  title,
}: Readonly<{
  items: readonly (readonly [string, number, number])[];
  title: string;
}>) {
  const topItem = items[0];

  return (
    <Widget className="h-full">
      <Widget.Header>
        <Widget.Title>{title}</Widget.Title>
        <Widget.Description>Selected month distribution</Widget.Description>
      </Widget.Header>
      <Widget.Content className="flex flex-col gap-4 p-3">
        {topItem ? (
          <KPI>
            <KPI.Header>
              <KPI.Title>Leading Category</KPI.Title>
              <KPI.Trend className="ml-auto" trend="up">
                Leading
              </KPI.Trend>
            </KPI.Header>
            <KPI.Content>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-2xl text-foreground">
                  {topItem[0]}
                </span>
                <span className="text-muted text-xs">
                  <NumberValue maximumFractionDigits={0} value={topItem[1]} />{" "}
                  registrations
                </span>
              </div>
              <KPI.Value
                maximumFractionDigits={1}
                style="percent"
                value={topItem[2] / 100}
              />
            </KPI.Content>
            <KPI.Progress status="success" value={topItem[2]} />
          </KPI>
        ) : null}

        <div className="flex flex-col gap-2">
          {items.map(([name, count, share], index) => (
            <div
              className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl bg-surface-secondary px-3 py-2.5"
              key={name}
            >
              <span className="text-muted text-sm tabular-nums">
                {index + 1}
              </span>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-medium text-foreground text-sm">
                  {name}
                </span>
                <div className="h-1.5 overflow-hidden rounded-full bg-background">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${share}%` }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end">
                <NumberValue maximumFractionDigits={0} value={count} />
                <span className="text-muted text-xs">{share}%</span>
              </div>
            </div>
          ))}
        </div>
      </Widget.Content>
    </Widget>
  );
}

function TopMakesWidget() {
  return (
    <Widget className="h-full">
      <Widget.Header>
        <Widget.Title>Top Makes</Widget.Title>
        <Widget.Description>2026 registrations</Widget.Description>
      </Widget.Header>
      <Widget.Content className="flex flex-col gap-2 p-3">
        {topMakes.map(([make, value], index) => (
          <div
            className="grid grid-cols-[2rem_1fr_auto] items-center gap-3 rounded-xl bg-surface-secondary px-3 py-2.5"
            key={make}
          >
            <span className="text-muted text-sm tabular-nums">{index + 1}</span>
            <span className="font-medium text-foreground text-sm">{make}</span>
            <NumberValue maximumFractionDigits={0} value={value} />
          </div>
        ))}
      </Widget.Content>
    </Widget>
  );
}

function MovementWidget() {
  return (
    <Widget className="h-full">
      <Widget.Header>
        <Widget.Title>What Changed</Widget.Title>
        <Widget.Description>Signals worth checking</Widget.Description>
      </Widget.Header>
      <Widget.Content className="grid gap-2 p-3">
        {[
          ["EVs crossed 64.9% share", "up"],
          ["Category E reached $125,002", "up"],
          ["Total registrations slowed YoY", "down"],
        ].map(([label, trend]) => (
          <div
            className="flex items-center justify-between gap-3 rounded-xl bg-surface-secondary p-3"
            key={label}
          >
            <span className="text-foreground text-sm">{label}</span>
            <TrendChip size="sm" trend={trend as "up" | "down"} variant="soft">
              {trend === "up" ? (
                <TrendingUp className="size-3" />
              ) : (
                <TrendingDown className="size-3" />
              )}
            </TrendChip>
          </div>
        ))}
      </Widget.Content>
    </Widget>
  );
}

function RegistrationChartWidget() {
  return (
    <Widget className="h-full">
      <Widget.Header>
        <Widget.Title>Yearly Registrations</Widget.Title>
        <Widget.Description>Registrations by month</Widget.Description>
      </Widget.Header>
      <Widget.Content>
        <BarChart data={marketData} height={200}>
          <BarChart.Grid vertical={false} />
          <BarChart.XAxis dataKey="month" tickMargin={8} />
          <BarChart.YAxis width={30} />
          <BarChart.Bar
            barSize={16}
            dataKey="registrations"
            fill="var(--accent)"
            radius={[4, 4, 0, 0]}
          />
          <BarChart.Tooltip content={<BarChart.TooltipContent />} />
        </BarChart>
      </Widget.Content>
    </Widget>
  );
}

function RecentInsightsWidget() {
  return (
    <Widget className="h-full">
      <Widget.Header>
        <Widget.Title>Latest Blog Posts</Widget.Title>
        <Widget.Description>
          Recent analysis with hero images
        </Widget.Description>
      </Widget.Header>
      <Widget.Content className="grid gap-3 md:grid-cols-3">
        {recentInsights.map((post, index) => (
          <article
            className="group overflow-hidden rounded-xl bg-surface-secondary transition-colors hover:bg-surface"
            key={post.title}
          >
            <div
              className="relative aspect-[16/9] overflow-hidden"
              style={{ background: post.image }}
            >
              <div className="absolute inset-0 opacity-35 [background-image:radial-gradient(circle_at_20%_20%,white_0,transparent_28%),linear-gradient(135deg,transparent_0,transparent_45%,rgba(255,255,255,.28)_45%,rgba(255,255,255,.28)_47%,transparent_47%)]" />
              <div className="absolute inset-0 bg-linear-to-t from-background/50 to-transparent" />
              <span className="absolute right-3 bottom-3 rounded-full bg-background/80 px-2.5 py-1 font-medium text-[10px] text-foreground uppercase tracking-wide backdrop-blur">
                Hero image
              </span>
              <Chip
                className="absolute top-3 left-3"
                color={index === 0 ? "accent" : "default"}
                size="sm"
                variant="soft"
              >
                {index === 0 ? "Latest" : post.category}
              </Chip>
            </div>
            <div className="flex flex-col gap-3 p-4">
              <div className="flex items-center justify-between gap-2 text-muted text-xs">
                <span>{post.meta}</span>
                <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
              </div>
              <h4 className="line-clamp-2 font-semibold text-foreground text-sm leading-5">
                {post.title}
              </h4>
              <p className="line-clamp-2 text-muted text-xs leading-5">
                {post.description}
              </p>
            </div>
          </article>
        ))}
      </Widget.Content>
    </Widget>
  );
}

function PolishedCurrentMockup() {
  return (
    <div className="bg-background">
      <PublicNavbar />
      <RouteChipNav />
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-5 p-5 md:p-8">
        <QuickGlanceHeader description="A cleaned-up version of the current homepage: the same bento dashboard idea, tighter hierarchy, and fewer marketing gestures." />
        <SignalKpis />
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <CoeResultsWidget />
          </div>
          <div className="lg:col-span-5">
            <TopMakesWidget />
          </div>
          <div className="lg:col-span-8">
            <RegistrationChartWidget />
          </div>
          <div className="lg:col-span-4">
            <MovementWidget />
          </div>
          <div className="lg:col-span-6">
            <CategoryBreakdownWidget items={fuelTypes} title="Fuel Types" />
          </div>
          <div className="lg:col-span-6">
            <CategoryBreakdownWidget
              items={vehicleTypes}
              title="Vehicle Types"
            />
          </div>
          <div className="lg:col-span-12">
            <RecentInsightsWidget />
          </div>
        </div>
      </div>
    </div>
  );
}
