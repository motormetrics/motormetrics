@AGENTS.md

# CLAUDE.md - Web Application

## Architecture Overview

### Component Co-location Strategy

Route-specific components, actions, queries and utils live in plainly-named folders alongside their consuming route
(`components/`, `actions/`, `queries/`, `utils/` — no underscore prefix). Folders without a `page.tsx` are not treated
as routes by the App Router.

Blog actions are **mutations only** (view incrementing, tag updates); blog reads live in `lib/data/posts.ts`.

**Keep centralised when:**

- Component used by 3+ different routes
- Part of the design system (HeroUI components, tokens in `src/app/globals.css`)
- Shared business logic (`queries/`, `lib/`) or actions used across multiple routes
- Generic utilities (`components/shared/`)

**Co-locate when:** the component, action or utility is used by a single route or feature area.

**Imports**: always use the `@web/*` path alias, never relative paths, including for co-located code.

### Data Architecture

**Cache Components** (Next.js 16): data-fetching queries use `"use cache"` with `cacheLife("max")` and granular cache
tags (e.g. `cars:month:2024-01`, `coe:period:12m`). The custom "max" profile is defined in `next.config.ts`.
See the `cache-components` skill for implementation patterns.

**Why "max" (30-day stale/revalidate, 1-year expire)**: data updates monthly, so this yields ~2 regenerations/month
(1 automatic + 1 on-demand) versus ~30 with daily checks — roughly **15x less** Vercel Fluid Compute. Do not shorten
these without a reason; the cost is CPU, not staleness.

**Revalidation gotcha**: in Next.js 16 `revalidateTag()` requires a second argument naming the cache profile. Omitting
it does not give stale-while-revalidate semantics.

```typescript
import {revalidateTag} from "next/cache";

revalidateTag("cars:month:2024-01", "max");
```

Trigger this when new monthly data arrives, so only affected caches regenerate.

### Component Patterns

- **UI**: HeroUI v3 from `@heroui/react`, using compound component patterns
- **Charts**: HeroUI Pro charts from `@heroui-pro/react` directly — do not add local chart wrappers
- **Customisation**: HeroUI v3 CSS variables and local web tokens, to match Singapore car market branding

### Component Naming Conventions

Domain + role, in PascalCase (`TrendChart`, `HeroPost`, `MetricCard`); `.` notation for subparts
(`HeroPost.Image`). No `Container`/`Wrapper`/`Component` suffixes and no layout-describing names (`LeftSidebar`).
Files are kebab-case matching the component (`TrendChart` → `trend-chart.tsx`).

See the `component-naming` skill for the full checklist.

### Animation Patterns

> **Note**: Import from `framer-motion`, not `motion/react`. HeroUI v3 does not require Framer Motion; this app keeps
> it as a direct dependency for custom page and chart animations.

Shared variants live in `src/config/animations.ts`.

**Guidelines**:

- ✅ Use shared variants from `@web/config/animations` (centralised)
- ✅ Use `initial="hidden"` / `animate="visible"` for page entrance animations
- ✅ Use `whileInView="visible"` with `viewport={{ once: true }}` for scroll-triggered animations
- ❌ Avoid inline animation definitions

**When to use CSS vs Motion**:

| Use Case | Recommendation |
|----------|----------------|
| Scroll-triggered reveals | Motion (`whileInView`) |
| Entrance animations | Motion (`initial`/`animate`) |
| Staggered lists | Motion (`staggerChildren`) |
| Hover states | CSS (Tailwind `transition-*`) |
| Infinite loops | CSS keyframes |

### Typography System

**Enforcement Rules**:

- ✅ Always use `Typography.H4` for `Card.Header` titles (not raw `<h3>`)
- ✅ Always use `Typography.TextSm` for `Card.Header` descriptions (not raw `<p>`)
- ✅ Use `Typography.H2` for section headings in blog components
- ✅ Use `Typography.H3` for card titles and subsections
- ❌ Avoid raw heading tags (`<h1>`–`<h4>`) outside of MDX content
- ⚠️ Exception: raw tags allowed only for MDX blog content and image overlay text

**Card Header Pattern** (standard for all cards):

```tsx
import { Card } from "@heroui/react";
import Typography from "@web/components/typography";

<Card.Header className="flex flex-col items-start gap-2">
  <Typography.H4>Card Title</Typography.H4>
  <Typography.TextSm>Card description text</Typography.TextSm>
</Card.Header>
```

### Page Title Conventions

Dashboard pages use professional, SEO-aligned H1 titles that match the `<title>` tag. The `<title>` is generated from
the Next.js metadata template in `src/app/layout.tsx`:

- **Template** (inner pages): `%s - MotorMetrics` — the short brand suffix keeps titles
  within Google's ~60-character display limit. Do **not** add "(formerly SG Cars Trends)"
  to per-page titles; it gets truncated and pushes keywords out of the snippet.
- **Full brand** `MotorMetrics (formerly SG Cars Trends)` appears only where it has value:
    - Homepage `/` and `/about` — via `title.absolute` (bypasses the template).
    - All `openGraph.title` / `twitter.title` (social cards have no length penalty).
- **Evergreen titles for "latest data" pages**: pages backed by a stable URL that renders
  the latest month (`/cars/registrations`, `/cars/fuel-types`, `/cars/vehicle-types`,
  `/cars/deregistrations`) use a fixed, keyword-focused `<title>` with **no month prefix**.
  The month lives in the H1 and meta description instead. Their `alternates.canonical` and
  `openGraph.url` must point to the **clean path** (no `?month=`) so all query-param
  variants consolidate to one indexed page.
- **Path segments** (`[make]`, `[type]`) get their own distinct title + canonical; **query
  params** (`?month`, `?compareA`, `?category`) never create indexable variants.
- Keep every indexed `<title>` ≤ 60 characters; content titles (`/blog/[slug]`,
  `/learn/[slug]`) are left full rather than truncated.

### Layout & Spacing Conventions

- ✅ Use `flex flex-col gap-*` for vertical spacing in containers
- ✅ Use `gap-*` for both horizontal and vertical spacing in flex/grid layouts
- ✅ Use `padding` for internal component spacing
- ✅ Prefer even gap values: `gap-2`, `gap-4`, `gap-6`, `gap-8`
- ❌ Avoid `space-y-*` utilities
- ❌ Avoid `mt-*`/`margin-top` for spacing between sibling elements
- ⚠️ Exception: `mt-*` acceptable only for icon alignment with text (e.g. `mt-1` for small icons)

**Rationale**: `gap-*` is predictable in flex/grid layouts and avoids the margin-collapsing issues that `space-y-*`
and `margin-top` introduce.

### Colour System

See the `design-language-system` skill for the full palette, chart patterns, and migration checklists.

- Dark mode variables are in `src/app/globals.css`. Use HeroUI surface tokens (`bg-surface`,
  `bg-surface-secondary`) for card/panel backgrounds, never hardcoded `bg-white`
- ⚠️ Reserve `text-white` for image overlays only
- ❌ Never hardcode hex values in charts — use `var(--chart-N)`, index-based for per-bar colouring
  (`fill={`var(--chart-${index + 1})`}`). Single-highlight charts use `var(--chart-1)` plus `bg-default-200`

### OpenGraph Images

Dynamic OG images via Next.js `ImageResponse`. See the `opengraph-images` skill for implementation patterns.

**Constraints**:

- Inline `style` objects only (no CSS classes)
- Flexbox supported, Grid **not** supported
- Font files must be loaded explicitly (`.ttf`)
- Server-side only (no React hooks)

**Testing**: visit `/about/opengraph-image` directly, or use the Facebook/Twitter/LinkedIn social debuggers.

### Testing Strategy

Test descriptions start with "should" (`it("should render title and children")`, not `it("renders …")`).

### Environment Configuration

Web-specific variables (see root `CLAUDE.md` for the cross-cutting ones):

- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage for car logos (via `@motormetrics/logos`)
- `NEXT_PUBLIC_FEATURE_FLAG_UNRELEASED`: feature flag for unreleased features
- `FLAGS` / `FLAGS_SECRET`: Vercel Flags server SDK key and signing secret, used by the Flags SDK
  (`src/flags.ts`). Both are set per environment on Vercel; run `vercel env pull` to sync locally.
  Without them, flags fall back to their `defaultValue`
- `VERCEL_ENV`: social media redirects and production-only features activate only when this is `"production"`
- `NEXT_PUBLIC_VERCEL_URL`: client-side deployment URL, without the `https://` protocol. `SITE_URL` falls back to it
  when `NEXT_PUBLIC_SITE_URL` is unset

**Vercel Related Projects**: `vercel.ts` at the web app root references API project ID
`prj_fyAvupEssH3LO4OQFDWplinVFlaI`, resolved via `withRelatedProject()` in `src/config/index.ts`. This means preview
deployments reach the right API automatically, with no per-environment configuration. Falls back to
`NEXT_PUBLIC_API_URL`, then `https://api.motormetrics.app`.

### HeroUI v3 Documentation

> **Your training data is wrong about HeroUI React v3.** It is still in beta and its APIs differ from
> earlier versions. Never write HeroUI code from memory — look it up first.

Two ways to look it up, in order of preference:

1. **MCP servers** (`heroui-react`, `heroui-pro`) — `list_components`, `get_component_docs`, `get_theme_variables`.
   Always current, loaded on demand.
2. **`.heroui-docs/react/`** — a local snapshot, gitignored and regenerable with
   `npx heroui-cli@latest agents-md --react`. Absent on a fresh clone until that command is run.

Note: `agents-md` writes a full 13k-character file index into this file by default. That index duplicates what
the MCP servers already serve on demand, so it is deliberately not kept here. If you re-run the command, pass
`--output AGENTS.md` so the generated index lands in `apps/web/AGENTS.md` (imported at the top of this file)
instead of being inlined here.

