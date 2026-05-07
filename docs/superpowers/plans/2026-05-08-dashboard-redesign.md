# Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the locked HeroUI Pro-first Quick Glance direction to the real public dashboard navigation and fuel/vehicle category pages.

**Architecture:** Keep the public dashboard sidebar-free and preserve the existing route-group structure. Implement the two-level navigation in the shared dashboard nav, then redesign category pages through the existing shared category components so `fuel-types/page.tsx` and `vehicle-types/page.tsx` stay thin config wrappers.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, HeroUI v3, HeroUI Pro `KPIGroup`, `KPI`, `BarChart`, and existing MotorMetrics data queries.

**Execution Mode:** Use subagent-driven development when implementation starts. Dispatch one fresh subagent per task, then run spec-compliance and code-quality reviews before marking each task complete. Track task status with beads (`bd`), not local markdown or in-session todo lists.

---

## File Structure

Modify `apps/web/src/app/(main)/(dashboard)/components/dashboard-nav.tsx`.
Responsibility: render the no-sidebar two-level dashboard route pills for Overview, Cars, and COE using existing `navigationSections`.

Modify `apps/web/src/app/(main)/(dashboard)/cars/components/category/category-overview.tsx`.
Responsibility: compose the category page shell, structured data, empty state, KPI summary, and detail tabs.

Modify `apps/web/src/app/(main)/(dashboard)/cars/components/category/category-insights-card.tsx`.
Responsibility: render the top summary KPI group with sharper dashboard styling and selected-month context.

Modify `apps/web/src/app/(main)/(dashboard)/cars/components/category/category-tabs-panel.tsx`.
Responsibility: render category tabs and selected-category detail layout with fewer wrappers.

Modify `apps/web/src/app/(main)/(dashboard)/cars/components/category/category-hero-card.tsx`.
Responsibility: render selected-category KPIs without emoji ranking or overly decorative copy.

Modify `apps/web/src/app/(main)/(dashboard)/cars/components/category/top-makes-chart.tsx`.
Responsibility: render HeroUI Pro vertical bars with token colours, tighter cards, and a useful unavailable-data state.

Do not modify `apps/web/src/app/(main)/(dashboard)/cars/fuel-types/page.tsx` or `apps/web/src/app/(main)/(dashboard)/cars/vehicle-types/page.tsx` unless their config copy needs final wording adjustments.

Do not add local chart wrappers. Use HeroUI Pro chart components directly.

Do not run checks unless the user explicitly asks; the user already requested to skip checks.

Track implementation with these beads:
- `sgcarstrends-b73` - Implement two-level dashboard navigation
- `sgcarstrends-zam` - Apply HeroUI Pro Quick Glance dashboard modules
- `sgcarstrends-y39` - Redesign fuel and vehicle category pages
- `sgcarstrends-ptg` - Show latest blog posts with hero images

---

### Task 1: Two-Level Dashboard Navigation

**Files:**
- Modify: `apps/web/src/app/(main)/(dashboard)/components/dashboard-nav.tsx`

- [ ] **Step 1: Replace the desktop Segment/dropdown split with two horizontal pill rows**

Use `ScrollShadow` for both levels. Keep `DashboardNav` as a client component because it uses `usePathname`.

```tsx
export function DashboardNav() {
  const pathname = usePathname();

  const activeSection =
    navigationSections.find((section) => isSectionActive(pathname, section)) ??
    navigationSections[0];
  const activeSectionItems = activeSection
    ? getSectionItems(activeSection)
    : [];

  return (
    <nav
      aria-label="Dashboard navigation"
      className="border-border/70 border-b bg-background/90 px-4 py-3 backdrop-blur-xl"
    >
      <div className="mx-auto flex w-full max-w-screen-2xl flex-col gap-3">
        <ScrollShadow hideScrollBar orientation="horizontal">
          <div className="flex gap-2">
            {navigationSections.map(({ href, icon: Icon, name }) => {
              const isActive = activeSection?.href === href;

              return (
                <Link
                  key={href}
                  className={cn(
                    buttonVariants({
                      size: "sm",
                      variant: isActive ? "primary" : "outline",
                    }),
                    "h-9 shrink-0 gap-1.5 rounded-full px-4",
                    isActive ? "pointer-events-none" : null,
                  )}
                  href={href}
                >
                  <Icon className="size-4" />
                  {name}
                </Link>
              );
            })}
          </div>
        </ScrollShadow>

        {activeSectionItems.length > 1 ? (
          <ScrollShadow hideScrollBar orientation="horizontal">
            <div className="flex gap-2 border-border border-t pt-3">
              {activeSectionItems.map(({ badge, icon: Icon, title, url }) => {
                const isActive = isItemActive(pathname, { title, url });

                return (
                  <Link
                    key={url}
                    className={cn(
                      buttonVariants({
                        size: "sm",
                        variant: isActive ? "secondary" : "tertiary",
                      }),
                      "h-8 shrink-0 gap-1.5 rounded-full px-3",
                      isActive ? "pointer-events-none" : null,
                    )}
                    href={url}
                  >
                    {Icon ? <Icon className="size-3.5" /> : null}
                    {title}
                    {badge ? <NewChip /> : null}
                  </Link>
                );
              })}
            </div>
          </ScrollShadow>
        ) : null}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Remove unused imports and handlers**

Remove `Key`, `Button`, `Dropdown`, `Label`, `Segment`, `Check`, `ChevronDown`, and `useRouter` imports. Keep `cn`, `ScrollShadow`, `buttonVariants`, `NewChip`, `Link`, `usePathname`, and navigation types.

Expected import shape:

```tsx
"use client";

import { cn, ScrollShadow } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { NewChip } from "@web/components/shared/chips";
import {
  type NavigationItem,
  type NavigationSection,
  navigationSections,
} from "@web/config/navigation";
import Link from "next/link";
import { usePathname } from "next/navigation";
```

- [ ] **Step 3: Manually inspect behaviour without running checks**

Open `/`, `/cars`, `/cars/fuel-types`, `/cars/vehicle-types`, and `/coe/results` in the app if a dev server is already running. Expected: first row highlights the active section and second row appears only when the section has child pages.

---

### Task 2: Category Page Shell

**Files:**
- Modify: `apps/web/src/app/(main)/(dashboard)/cars/components/category/category-overview.tsx`

- [ ] **Step 1: Tighten the header copy and preserve existing data loading**

Keep `CategoryOverviewHeaderMeta` and `CategoryOverviewContent` data flow unchanged. Change the subtitle to match the locked dashboard tone.

```tsx
<DashboardPageTitle
  title={config.title}
  subtitle={`Quick view of ${config.tabTitle.toLowerCase()} share, leaders, and registration mix for the selected month.`}
/>
```

- [ ] **Step 2: Replace the two animated fragments with one content stack**

Keep `StructuredData` before visible content. Use a single flex stack and preserve suspense fallbacks.

```tsx
return (
  <>
    <StructuredData data={structuredData} />
    {categoryData.length > 0 ? (
      <div className="flex flex-col gap-8">
        <AnimatedSection order={1}>
          <Suspense fallback={<SkeletonCard className="h-[240px] w-full" />}>
            <CategoryInsightsCard
              categoriesCount={categoryData.length}
              previousTotal={previousTotal}
              topPerformer={marketShare.dominantType}
              month={month}
              title={config.tabTitle}
              total={cars.total}
            />
          </Suspense>
        </AnimatedSection>

        <AnimatedSection order={2}>
          <Suspense fallback={<SkeletonCard className="h-[560px] w-full" />}>
            <CategoryTabsPanel
              types={categoryData}
              month={month}
              title={config.tabTitle}
              totalRegistrations={cars.total}
              topMakesByFuelType={topMakesByFuelType}
            />
          </Suspense>
        </AnimatedSection>
      </div>
    ) : (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <Typography.Text>
          No {config.title.toLowerCase()} data available for {formattedMonth}
        </Typography.Text>
      </div>
    )}
  </>
);
```

- [ ] **Step 3: Do not add new queries**

Vehicle Types currently has no top-makes breakdown. Preserve that behaviour and handle it in the visual state rather than expanding data scope.

---

### Task 3: Category Summary KPI Group

**Files:**
- Modify: `apps/web/src/app/(main)/(dashboard)/cars/components/category/category-insights-card.tsx`

- [ ] **Step 1: Keep the existing props and simplify the module wrapper**

Use a bordered `bg-surface` shell around the HeroUI Pro KPI group. Keep `Chip` and `KPIGroup`.

```tsx
return (
  <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-surface md:p-5">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <Typography.H4>{title} Snapshot</Typography.H4>
        <Typography.TextSm>
          Registration mix for the latest available {formattedMonth} dataset.
        </Typography.TextSm>
      </div>
      <Chip className="w-fit" color="accent" size="sm" variant="soft">
        {formattedMonth}
      </Chip>
    </div>

    <KPIGroup>
      {/* existing KPI children stay here with the edits below */}
    </KPIGroup>
  </section>
);
```

- [ ] **Step 2: Rename KPI labels to match dashboard language**

Use these labels exactly:

```tsx
<KPI.Title>Total Registrations</KPI.Title>
<KPI.Title>Active {title}s</KPI.Title>
<KPI.Title>Leading {title}</KPI.Title>
<KPI.Title>Leader Share</KPI.Title>
```

- [ ] **Step 3: Use token-coloured values and remove oversized styling**

For the first KPI, replace `className="text-4xl text-accent"` with:

```tsx
className="text-3xl text-accent"
```

For secondary numeric KPIs, use:

```tsx
className="text-2xl text-foreground"
```

For the top performer text, use:

```tsx
<span className="font-semibold text-2xl text-foreground">
  {topPerformer.name}
</span>
```

- [ ] **Step 4: Keep comparison logic unchanged**

Do not change `hasComparison`, `changeRatio`, `isPositive`, or `trend`; only adjust presentation.

---

### Task 4: Selected Category Detail Panel

**Files:**
- Modify: `apps/web/src/app/(main)/(dashboard)/cars/components/category/category-tabs-panel.tsx`

- [ ] **Step 1: Keep memoized maps and remove noisy comments**

Keep both `useMemo` calls because they avoid recomputing map/rank data per tab. Remove comments that describe obvious code.

- [ ] **Step 2: Use a dashboard panel around Tabs**

Replace the outer `div` with a section shell.

```tsx
return (
  <section className="rounded-2xl border border-border bg-surface p-4 shadow-surface md:p-5">
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography.H4>{title} Breakdown</Typography.H4>
        <Typography.TextSm>
          Select a {title.toLowerCase()} to inspect its registration share and make mix.
        </Typography.TextSm>
      </div>

      <Tabs className="w-full" variant="secondary">
        {/* existing tab list and panels stay here */}
      </Tabs>
    </div>
  </section>
);
```

- [ ] **Step 3: Tighten panel layout**

Inside each `Tabs.Panel`, use:

```tsx
<div className="flex flex-col gap-5 py-4">
  <CategoryHeroCard
    typeName={formatVehicleType(type.name)}
    count={type.count}
    totalRegistrations={totalRegistrations}
    month={month}
    rank={rank}
    totalCategories={types.length}
  />

  {fuelTypeData && fuelTypeData.makes.length > 0 ? (
    <TopMakesChart
      makes={fuelTypeData.makes}
      total={fuelTypeData.total}
      title={formatVehicleType(type.name)}
    />
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface-secondary p-8 text-center">
      <Typography.H4>Top Makes Unavailable</Typography.H4>
      <Typography.TextSm>
        Make-level data is not available for {formatVehicleType(type.name)} in this view.
      </Typography.TextSm>
    </div>
  )}
</div>
```

---

### Task 5: Selected Category KPIs

**Files:**
- Modify: `apps/web/src/app/(main)/(dashboard)/cars/components/category/category-hero-card.tsx`

- [ ] **Step 1: Remove emoji ranking**

Delete the `getRankingEmoji` import and remove the emoji span in the ranking KPI.

- [ ] **Step 2: Update the ranking KPI content**

Use plain dashboard data styling.

```tsx
<KPI.Content>
  <div className="flex items-baseline gap-2">
    <span className="font-semibold text-3xl text-foreground">#{rank}</span>
    <span className="text-muted text-sm">of {totalCategories}</span>
  </div>
</KPI.Content>
```

- [ ] **Step 3: Make value sizing consistent**

Use `text-3xl` for the main selected-category registration count and market share. Keep `text-accent` only for the selected-category count.

```tsx
<KPI.Value
  className="text-3xl text-accent"
  locale="en-SG"
  maximumFractionDigits={0}
  value={count}
/>
```

```tsx
<KPI.Value
  className="text-3xl text-foreground"
  maximumFractionDigits={1}
  style="percent"
  value={marketSharePercentage / 100}
/>
```

- [ ] **Step 4: Keep date formatting and math unchanged**

Do not alter `marketSharePercentage` or `formattedMonth`.

---

### Task 6: Top Makes Chart Polish

**Files:**
- Modify: `apps/web/src/app/(main)/(dashboard)/cars/components/category/top-makes-chart.tsx`

- [ ] **Step 1: Keep HeroUI Pro BarChart and token fills**

Keep this mapping intact so bars use CSS variables instead of hardcoded colours.

```tsx
const chartData = makes.map((item, index) => ({
  name: item.make,
  value: item.count,
  percentage: total > 0 ? (item.count / total) * 100 : 0,
  fill: `var(--chart-${index + 1})`,
}));
```

- [ ] **Step 2: Update empty state card**

Use a smaller, sharper data placeholder.

```tsx
if (!makes || makes.length === 0) {
  return (
    <Card className="border border-border bg-surface shadow-none">
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>Top Makes</Typography.H4>
        <Typography.TextSm>No make data available</Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <div className="flex h-52 items-center justify-center rounded-xl bg-surface-secondary">
          <Typography.TextSm>No data available</Typography.TextSm>
        </div>
      </Card.Content>
    </Card>
  );
}
```

- [ ] **Step 3: Update filled chart card**

Use a bordered card, tighter top chips, and existing links.

```tsx
return (
  <Card className="border border-border bg-surface shadow-none">
    <Card.Header className="flex flex-col items-start gap-2">
      <Typography.H4>Top Makes - {title}</Typography.H4>
      <Typography.TextSm>{description}</Typography.TextSm>
    </Card.Header>
    <Card.Content>
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap gap-2">
          {topThree.map((item, index) => (
            <Link key={item.name} href={`/cars/makes/${slugify(item.name)}`}>
              <Chip
                className="cursor-pointer first-of-type:bg-accent first-of-type:text-accent-foreground"
                size="sm"
                variant="soft"
              >
                #{index + 1} {item.name}
              </Chip>
            </Link>
          ))}
        </div>

        <BarChart data={chartData} height={300} layout="vertical">
          <BarChart.Grid
            className="stroke-border"
            horizontal={false}
            strokeDasharray="3 3"
          />
          <BarChart.XAxis
            axisLine={false}
            tickFormatter={formatNumber}
            tickLine={false}
            type="number"
          />
          <BarChart.YAxis
            axisLine={false}
            dataKey="name"
            tickLine={false}
            type="category"
          />
          <BarChart.Tooltip
            content={<BarChart.TooltipContent />}
            cursor={{ fill: "var(--muted)", opacity: 0.2 }}
          />
          <BarChart.Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </div>
    </Card.Content>
  </Card>
);
```

- [ ] **Step 4: Remove unused imports**

Remove `getRankingEmoji` from this file after replacing ranking chips with numeric labels.

---

### Task 7: Manual Review Without Checks

**Files:**
- Inspect: `apps/web/src/app/(main)/(dashboard)/components/dashboard-nav.tsx`
- Inspect: `apps/web/src/app/(main)/(dashboard)/cars/components/category/*.tsx`

- [ ] **Step 1: Confirm no forbidden visual language remains**

Search changed files for these strings and remove them if present:

```text
live
Live
```

Expected: no user-facing dashboard copy describes data as live.

- [ ] **Step 2: Confirm chart colours use tokens**

Search changed files for hardcoded colour hex values.

Expected: no new hardcoded chart hex colours; chart values use `var(--chart-*)`, `var(--muted)`, or semantic classes.

- [ ] **Step 3: Confirm no checks were run**

Do not run `pnpm test`, `pnpm lint`, `pnpm build`, or `pnpm typecheck` because the user explicitly requested to skip checks. In the final response, state that checks were skipped by request.

---

## Self-Review

Spec coverage: This plan covers two-level dashboard navigation, HeroUI Pro KPI/chart modules, category-page redesign through shared components, token-based colours, no live language, and no checks by user request.

Placeholder scan: No placeholder markers or undefined future work remain in the plan.

Type consistency: Existing prop names and route aliases are preserved. No new query contracts or persisted data changes are introduced.
