---
name: chart-implementation
description: Create interactive charts for car registration and COE data visualization using Recharts. Use when adding new chart types, fixing chart bugs, or implementing data visualizations.
allowed-tools: Read, Edit, Write, Grep, Glob
---

# Chart Implementation Skill

Uses **Recharts** via shadcn/ui `ChartContainer` for data visualization. Always use CSS variables for colors (see `design-language-system` skill).

## Core Pattern

All charts use `ChartContainer` from `@sgcarstrends/ui/components/chart` wrapped in `ChartWidget` from `@web/components/charts/widget`. **Never use raw `ResponsiveContainer` directly.**

```tsx
"use client";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@sgcarstrends/ui/components/chart";
import { ChartWidget } from "@web/components/charts/widget";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis } from "recharts";

export function TopMakesChart({ data }: { data: { make: string; count: number }[] }) {
  const chartConfig = {
    count: { label: "Count", color: "var(--chart-1)" },
  };

  return (
    <ChartWidget title="Top Makes" isEmpty={data.length === 0}>
      <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <BarChart data={data}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-default-200" />
          <XAxis dataKey="make" tickLine={false} axisLine={false} className="text-xs" />
          <YAxis tickLine={false} axisLine={false} className="text-xs" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="count" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </ChartWidget>
  );
}
```

## ChartContainer

`ChartContainer` wraps Recharts' `ResponsiveContainer` with theming support. Set dimensions via CSS class on the container:

```tsx
// ✅ Correct - height via className
<ChartContainer config={chartConfig} className="h-[300px] w-full">
  <BarChart data={data}>...</BarChart>
</ChartContainer>

// ❌ Wrong - raw ResponsiveContainer
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={data}>...</BarChart>
</ResponsiveContainer>
```

### Width/Height -1 Warning

Recharts `ResponsiveContainer` logs `width(-1) and height(-1)` warnings on first render before `ResizeObserver` fires. Fix by setting `initialDimension` on `ResponsiveContainer` in `packages/ui/src/components/chart.tsx`:

```tsx
<RechartsPrimitive.ResponsiveContainer initialDimension={{ width: 0, height: 400 }}>
  {children}
</RechartsPrimitive.ResponsiveContainer>
```

Reference: [shadcn/ui PR #8486](https://github.com/shadcn-ui/ui/pull/8486), [recharts #6716](https://github.com/recharts/recharts/issues/6716)

## ChartWidget

Wraps charts in a Card with title, subtitle, empty state, and entrance animation:

```tsx
<ChartWidget
  title="Registration Trends"
  subtitle="Monthly breakdown"
  isEmpty={data.length === 0}
  emptyMessage="No trend data available"
>
  <ChartContainer ...>...</ChartContainer>
</ChartWidget>
```

## Chart Config

Define chart config for theming and legend/tooltip labels:

```tsx
const chartConfig = {
  diesel: { label: "Diesel", color: "var(--chart-1)" },
  petrol: { label: "Petrol", color: "var(--chart-2)" },
  electric: { label: "Electric", color: "var(--chart-3)" },
};
```

## Performance

### Memoize Data and Config

```typescript
const chartConfig = useMemo(() => {
  return Object.fromEntries(
    categories.map((category, index) => [
      category,
      { label: category, color: `var(--chart-${index + 1})` },
    ]),
  );
}, [categories]);
```

## Best Practices

1. **ChartContainer** - Always use `ChartContainer` with `className="h-[300px] w-full"` (never raw `ResponsiveContainer`)
2. **ChartWidget** - Wrap in `ChartWidget` for consistent card layout and empty states
3. **CSS Variables** - Use `var(--chart-N)` for colors (1-6 available)
4. **Axis styling** - Use `tickLine={false} axisLine={false} className="text-xs"` for clean axes
5. **Grid** - Use `<CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-default-200" />`
6. **Tooltips** - Use shadcn `<ChartTooltip content={<ChartTooltipContent />} />`
7. **Memoize** - Use `useMemo` for chart config and data transformations

## References

- Recharts: Use Context7 for latest docs
- Design Language System: See `design-language-system` skill for colors
- Chart component source: `packages/ui/src/components/chart.tsx`
- Widget component: `apps/web/src/components/charts/widget.tsx`
