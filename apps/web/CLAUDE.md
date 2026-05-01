# CLAUDE.md - Web Application

This file provides guidance to Claude Code (claude.ai/code) when working with the web application in this repository.

## Development Commands

Essential commands for development:

```bash
# Development
pnpm dev                 # Start development server with Turbopack
pnpm build              # Build for production with Turbopack
pnpm start              # Start production server

# Testing
pnpm test               # Run unit tests with Vitest
pnpm test:run           # Run tests once
pnpm test:coverage      # Run tests with coverage report
pnpm test:e2e           # Run Playwright E2E tests
pnpm test:e2e:ui        # Run E2E tests with Playwright UI

# Code Quality
pnpm lint               # Run Next.js ESLint
pnpm format             # Format code with Biome

# Deployment via Vercel (automatic on push to main)
```

## Architecture Overview

### Tech Stack

- **Framework**: Next.js 16.1 with App Router and React 19.2
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **State Management**: Zustand with persistence
- **Styling**: Tailwind CSS v4 with HeroUI components
- **Animations**: Framer Motion with shared variants (`@web/config/animations`)
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Deployment**: Vercel (Singapore region)

### Key Directories

```
src/
├── app/                           # Next.js App Router - pages, layouts, API routes
│   ├── (main)/                    # Main site layout group
│   │   ├── (explore)/             # Explore route group (cars, COE data)
│   │   │   ├── components/        # Explore-level shared components (co-located)
│   │   │   ├── cars/              # Car data routes
│   │   │   │   ├── registrations/ # Car registrations (/cars/registrations)
│   │   │   │   ├── fuel-types/    # Fuel type breakdowns (/cars/fuel-types)
│   │   │   │   ├── vehicle-types/ # Vehicle type breakdowns (/cars/vehicle-types)
│   │   │   │   ├── makes/         # Car makes (/cars/makes)
│   │   │   │   ├── annual/        # Annual statistics (/cars/annual)
│   │   │   │   ├── deregistrations/ # Deregistrations (/cars/deregistrations)
│   │   │   │   ├── parf/          # PARF rates (/cars/parf)
│   │   │   │   └── components/    # Cars route-specific components (co-located)
│   │   │   └── coe/               # COE data routes
│   │   │       ├── results/       # COE results (/coe/results)
│   │   │       ├── premiums/      # COE premiums (/coe/premiums)
│   │   │       ├── pqp/           # PQP rates (/coe/pqp)
│   │   │       └── components/    # COE route-specific components (co-located)
│   │   ├── blog/                  # Blog routes
│   │   │   ├── actions/           # Blog-specific server actions (co-located)
│   │   │   └── components/        # Blog-specific components (co-located)
│   │   └── about/, contact/, faq/ # Static pages
│   ├── (social)/                  # Social media redirect routes with UTM tracking
│   ├── admin/                     # Integrated admin interface for content management
│   │   ├── (dashboard)/           # Admin dashboard routes
│   │   ├── actions/               # Admin-specific actions
│   │   ├── components/            # Admin-specific components
│   │   └── lib/                   # Admin utilities and helpers
│   ├── api/                       # API routes (analytics, OG images, revalidation)
│   └── store/                     # Zustand store slices
├── actions/                       # Server actions (maintenance tasks)
├── queries/                       # Data fetching queries (cars, COE, deregistrations, vehicle population, logos)
│   ├── cars/                      # Car data queries with comprehensive tests
│   ├── coe/                       # COE data queries with comprehensive tests
│   ├── deregistrations/           # Deregistration data queries (monthly, category breakdowns)
│   ├── vehicle-population/        # Vehicle population queries (yearly totals, fuel type breakdown, available years)
│   ├── logos/                     # Logo queries
│   └── __tests__/                 # Comprehensive query test suite
├── components/                    # Shared React components
│   ├── coe/                       # Shared COE components (latest-coe.tsx for home page)
│   ├── dashboard/                 # Shared dashboard components (navigation, skeletons)
│   ├── shared/                    # Generic shared components (chips, currency, metric-card)
│   └── [others]                   # Shared components used across multiple routes
├── config/                        # App configuration (DB, Redis, navigation, animations)
├── lib/                           # Shared data fetching and business logic
├── schema/                        # Drizzle database schemas
├── types/                         # TypeScript definitions
└── utils/                         # Utility functions with comprehensive tests
```

### Component Co-location Strategy

This application follows **Vercel/Next.js co-location best practices** with route-specific folders:

#### Co-located Components (`components/`)

Route-specific components live alongside their consuming routes:

- **Explore**: `app/(main)/(explore)/components/` - Recent posts, section tabs, charts, animated sections
- **Blog**: `app/(main)/blog/components/` - Progress bar, view counter, related posts, blog list
- **Cars**: `app/(main)/(explore)/cars/components/` - Category tabs, make selectors, trend charts
- **Cars Registrations**: `app/(main)/(explore)/cars/registrations/components/` - Registration-specific components
- **COE**: `app/(main)/(explore)/coe/components/` - COE categories, premium charts, PQP components
- **Deregistrations**: `app/(main)/(explore)/cars/deregistrations/components/` - Category charts, trends, breakdown tables

#### Co-located Actions (`actions/`)

Route-specific server actions (mutations only):

- **Blog**: `app/(main)/blog/actions/` - View incrementing, tag updates (mutations only; reads are in `lib/data/posts.ts`)

#### Centralised vs Co-located

**Keep Centralised When:**

- Component used by 3+ different routes
- Part of design system (use HeroUI components from `@heroui/react` and shared tokens from `@motormetrics/theme`)
- Shared business logic (`queries/`, `lib/`)
- Server actions used across multiple routes (`actions/`)
- Generic utilities (`components/shared/`)

**Co-locate When:**

- Component only used by single route or route segment
- Action/query specific to one feature area (use `actions/` or `queries/` in route folders)
- Utility function only needed in one place

#### Import Strategy

**Always use path aliases** for imports:

```typescript
// ✅ Co-located components via path alias
import {ProgressBar} from "@web/app/(main)/blog/components/progress-bar";
import {VehiclePopulationMetrics} from "@web/app/(main)/(explore)/cars/annual/components/vehicle-population-metrics";

// ✅ Shared queries and actions via path alias
import {getCarRegistrations} from "@web/queries/cars";
import {getLatestCOE} from "@web/queries/coe";
import {subscribeAction} from "@web/actions";

// ✅ Shared components via existing alias
import {MetricCard} from "@web/components/shared/metric-card";
import {Button} from "@heroui/react";

// ❌ Avoid relative imports for co-located code
import {ProgressBar} from "../components/progress-bar"; // Don't use
```

#### Folder Naming Convention

Route-specific folders in `app/` use standard naming (no underscore prefix):

- `components/` - React components
- `actions/` - Server actions
- `queries/` - Data fetching functions (if needed)
- `utils/` - Route-specific utilities (if needed)

**Note**: Folders without a `page.tsx` file are not treated as routes by Next.js App Router.

### Data Architecture

**Database**: Uses Drizzle ORM with PostgreSQL for car registration data, COE bidding results, vehicle deregistrations, and blog posts. Database connection configured in `src/config/db.ts`.

**State Management**: Zustand store with persistence in `src/app/store.ts` manages:

- Date selection across components
- COE category filters
- Notification preferences

**Caching**: Redis (Upstash) for API response caching, rate limiting, and blog view tracking.

**Cache Components & Optimization** (Next.js 16):

The application implements Next.js 16 Cache Components with `"use cache"` directives optimized for monthly data updates:

- **Cache Directives**: All data fetching queries use `"use cache"` with `cacheLife("max")` for monthly data
- **Cache Profile**: Custom "max" profile optimized for CPU efficiency (30-day revalidation aligned with monthly updates)
- **Cache Tags**: Granular tags for precise on-demand invalidation (e.g., `cars:month:2024-01`, `coe:period:12m`)
- **Tagged Queries**: All queries include cache tags for manual revalidation via `revalidateTag()`
- **Cache Configuration**: `next.config.ts` defines custom "max" profile with 30-day stale/revalidate, 1-year expire
- **Revalidation Strategy**: On-demand via `revalidateTag()` when monthly data arrives (bypasses 30-day cache)

**Cache Tag Patterns**:

Granular cache tags enable precise invalidation without over-fetching:

| Tag Pattern | Description | Example |
|-------------|-------------|---------|
| `cars:month:{month}` | Month-specific car data | `cars:month:2024-01` |
| `cars:year:{year}` | Year-specific car data | `cars:year:2024` |
| `cars:make:{make}` | Make-specific car data | `cars:make:toyota` |
| `cars:fuel:{fuelType}` | Fuel type-specific data | `cars:fuel:electric` |
| `cars:vehicle:{vehicleType}` | Vehicle type-specific data | `cars:vehicle:saloon` |
| `cars:category:{category}` | Category-specific data | `cars:category:saloon` |
| `cars:makes` | Car makes list | - |
| `cars:months` | Available months list | - |
| `cars:annual` | Yearly registration totals | - |
| `coe:results` | All COE results | - |
| `coe:latest` | Latest COE results | - |
| `coe:period:{period}` | Period-filtered COE data | `coe:period:12m` |
| `coe:category:{category}` | Category-specific COE data | `coe:category:A` |
| `coe:year:{year}` | Year-specific COE data | `coe:year:2024` |
| `coe:months` | Available COE months list | - |
| `coe:pqp` | PQP rates data | - |
| `deregistrations:month:{month}` | Month-specific deregistration data | `deregistrations:month:2024-01` |
| `deregistrations:year:{year}` | Year-specific deregistration data | `deregistrations:year:2024` |
| `deregistrations:months` | Available deregistration months | - |
| `posts:list` | Blog post list | - |
| `posts:slug:{slug}` | Individual blog post | `posts:slug:jan-2024-analysis` |
| `posts:views:{postId}` | Individual post view count | `posts:views:abc123` |
| `posts:popular` | Popular posts list | - |
| `posts:related:{postId}` | Related posts for a post | `posts:related:abc123` |
| `vehicle-population:years` | Available vehicle population years | - |
| `vehicle-population:totals` | Yearly population totals | - |
| `vehicle-population:year:{year}` | Year-specific population data | `vehicle-population:year:2024` |

**Cache Strategy Best Practices**:

- Use `"use cache"` directive at the top of async functions that fetch data
- Apply `cacheLife("max")` for monthly data (30-day client/server cache)
- Tag with granular scopes based on query parameters for precise invalidation
- Trigger `revalidateTag()` when new data arrives to bypass automatic revalidation
- See `cache-components` skill for implementation patterns

**CPU Optimization**:

The custom "max" profile minimizes Vercel Fluid Compute usage:
- **Client cache (stale)**: 30 days - users get instant page loads for 30 days, minimal server requests
- **Server cache (revalidate)**: 30 days - ~1 automatic regeneration/month (aligns with monthly data cycle)
- **Cache expiration (expire)**: 1 year - long-term cache persistence across traffic gaps
- **On-demand revalidation**: Manual `revalidateTag()` triggers immediate cache refresh when new data arrives
- **Result**: ~2 regenerations/month (1 automatic + 1 manual) vs ~30 with daily checks = **15x CPU savings**

**Cache Implementation Examples**:

```typescript
import {cacheLife, cacheTag} from "next/cache";

// Static list query - uses simple tag
export const getDistinctMakes = async () => {
    "use cache";
    cacheLife("max");
    cacheTag("cars:makes");  // Static tag for makes list

    return db.selectDistinct({make: cars.make}).from(cars).orderBy(cars.make);
};

// Parameterised query - uses dynamic tag
export const getTopTypes = async (month: string) => {
    "use cache";
    cacheLife("max");
    cacheTag(`cars:month:${month}`);  // Dynamic tag includes parameter

    return db.select(...).from(cars).where(eq(cars.month, month));
};

// Multiple parameters - uses multiple tags
export const getCarMarketShareData = async (month: string, category: string) => {
    "use cache";
    cacheLife("max");
    cacheTag(`cars:month:${month}`, `cars:category:${category}`);

    // Query implementation
};
```

This pattern is used across all query functions in `src/queries/cars/` and `src/queries/coe/` directories.

**On-demand Cache Revalidation**:

When new monthly data arrives, trigger targeted cache invalidation. In Next.js 16, `revalidateTag()` requires a second
argument specifying the cache profile (use `"max"` for stale-while-revalidate semantics):

```typescript
import {revalidateTag} from "next/cache";

// Invalidate specific month's car data
revalidateTag("cars:month:2024-01", "max");

// Invalidate specific make's data
revalidateTag("cars:make:toyota", "max");

// Invalidate COE results
revalidateTag("coe:results", "max");
revalidateTag("coe:latest", "max");

// Invalidate COE results for a specific period
revalidateTag("coe:period:12m", "max");

// Invalidate COE category data
revalidateTag("coe:category:A", "max");

// Invalidate PQP rates
revalidateTag("coe:pqp", "max");

// Invalidate static lists when new data adds new entries
revalidateTag("cars:makes", "max");
revalidateTag("cars:months", "max");
revalidateTag("coe:months", "max");

// Invalidate deregistration data
revalidateTag("deregistrations:month:2024-01", "max");
revalidateTag("deregistrations:months", "max");

// Invalidate vehicle population data
revalidateTag("vehicle-population:years", "max");
revalidateTag("vehicle-population:totals", "max");
revalidateTag("vehicle-population:year:2024", "max");
```

This precisely invalidates only affected caches, avoiding unnecessary regeneration of unrelated queries.

**Data Queries**: Organized in `src/queries/` directory with comprehensive test coverage:

- **Car Queries** (`queries/cars/`): Registration data, market insights, makes, yearly statistics, filter options
- **COE Queries** (`queries/coe/`): Historical results, latest results, available months, PQP rates
- **Deregistration Queries** (`queries/deregistrations/`): Monthly deregistration data, category breakdowns, available months, totals by month
- **Vehicle Population Queries** (`queries/vehicle-population/`): Annual vehicle population by fuel type, yearly totals, available years
- **Logo Queries** (`queries/logos/`): Dynamic logo loading via `@motormetrics/logos` package with Vercel Blob storage
- All queries include comprehensive unit tests in `queries/__tests__/`

**Car Logos**: Dynamic logo loading via `@motormetrics/logos` package with Vercel Blob storage:

- Logo queries in `src/queries/logos/` fetch logos from Vercel Blob
- `getLogoUrlMap()` pre-fetches all logos for the makes list page
- `getCarLogo(brand)` fetches individual logos for make detail pages
- Logos cached in Redis (24-hour TTL for individual logos, 1-hour TTL for list)
- Automatic fallback when logos are unavailable (components hide logo display)

**Server Actions**: Organized in `src/actions/` directory for write operations:

- Maintenance tasks (`actions/maintenance.ts`)
- Blog-specific actions co-located in `src/app/(main)/blog/actions/` (view counting, related posts)

**Social Media Integration**: Implements domain-based redirect routes in `src/app/(social)/` that provide trackable,
SEO-friendly URLs for all social media platforms. Each route includes standardised UTM parameters for analytics
tracking.

### API Structure

**REST API** (`src/app/api/v1/`):

- `GET/POST /api/v1/posts` — list and create blog posts (Bearer token auth)
- `GET/PUT/DELETE /api/v1/posts/[id]` — single post CRUD by UUID (Bearer token auth)
- Shared auth helper at `src/app/api/v1/lib/auth.ts`

**External API integration** through `src/utils/api/` for:

- Car comparison data
- Market share analytics
- Top performer statistics

### UTM Tracking

**UTM Utilities** (`src/utils/utm.ts`):

- **External Campaigns**: `createExternalCampaignURL()` for marketing campaigns and external traffic sources
- **Parameter Reading**: `useUTMParams()` React hook for future analytics implementation (currently unused)
- **Best Practices**: Follows industry standards with no UTM tracking on internal navigation
- **Type Safety**: Full TypeScript support with `UTMParams` interface and nuqs integration

### Component Patterns

**Typography System**: Semantic typography components in `src/components/typography.tsx` implementing a modern design
philosophy inspired by Vercel, Linear, and Stripe. Uses lighter font weights (semibold for primary headings, medium for
secondary headings/labels, normal for body text) with hierarchy driven by size and spacing.
See [Typography System](#typography-system) section below.

**UI Components**: HeroUI v3 is the primary component library, imported from `@heroui/react` with compound component patterns.

**Charts**: Recharts-based chart wrappers live locally in `src/components/charts/chart.tsx` for data visualization.

**Dashboard Components**: Interactive components for the homepage including:

- Section tabs with responsive overflow handling and dynamic font sizing
- Latest COE results display with card-based layout
- Recent posts sidebar with link navigation
- Annual vehicle population charts and fuel type breakdown

**Blog Components**: Co-located components in `src/app/(main)/blog/components/` including:

- Progress bar for reading progress tracking
- View counter with Redis-backed analytics
- Related posts recommendations
- AI content attribution badges

**Layout**: Shared layout components (Header, Footer) with responsive design and blog navigation.

**Social Sharing**: `ShareButtons` component (`src/components/share-buttons.tsx`) provides social media sharing across all pages:

- Responsive design: native Web Share API on mobile, individual buttons (X, LinkedIn, copy link) on desktop
- CSS-only responsive behaviour using Tailwind classes (`flex md:hidden` / `hidden md:flex`)
- Integrated into all statistics pages, blog posts, and dashboard views
- Share utilities in `src/utils/share.ts` for URL generation and clipboard operations

### Component Naming Conventions

Component naming follows domain + role patterns for clarity and consistency.

**Core Rules:**

| Rule | Description |
|------|-------------|
| PascalCase | All components use PascalCase (`TrendChart`, not `trendChart`) |
| Domain + Role | Combine context with role (`TrendChart`, `HeroPost`, `MetricCard`) |
| Compound Components | Use `.` notation for subparts (`HeroPost.Image`, `HeroPost.Title`) |
| No Suffixes | Avoid Container, Wrapper, Component suffixes |
| No Layout Names | Avoid Left, Big, Red, TwoColumn in names |

**Examples:**

```typescript
// ✅ Good naming
export const TrendChart = () => {};
export const HeroPost = () => {};
HeroPost.Image = () => {};
HeroPost.Title = () => {};

// ❌ Bad naming
export const Chart = () => {};           // Too generic
export const ChartWrapper = () => {};    // Suffix
export const LeftSidebar = () => {};     // Layout description
```

**File Naming:** kebab-case matching component (`TrendChart` → `trend-chart.tsx`)

See `component-naming` skill for detailed guidance and validation checklist.

### Animation Patterns

A consistent approach to animations using Framer Motion for scroll-triggered reveals and entrance effects.

> **Note**: Import from `framer-motion`, not `motion/react`. HeroUI v2 depends on `framer-motion` as a peer dependency. Migration to `motion/react` will be possible after upgrading to HeroUI v3.

**Design Philosophy**:

- Declarative animations with Motion's `whileInView` and `initial`/`animate`
- Shared variants for consistency across components
- CSS for hover states and infinite animations

**Key Files**:

| File | Purpose |
|------|---------|
| `src/config/animations.ts` | Shared animation variants (centralised) |
| `src/components/animated-number.tsx` | Number animation component |

**Standard Variants**:

```typescript
import { fadeInUpVariants, staggerContainerVariants, staggerItemVariants } from "@web/config/animations";
```

- `fadeInVariants` - Simple fade-in (opacity only)
- `fadeInUpVariants` - Fade-in with upward motion (opacity + y: 16)
- `staggerContainerVariants` - Container for staggered children (0.08s delay between children)
- `staggerItemVariants` - Individual stagger item (fade-in-up)
- `scaleInVariants` - Fade-in with scale effect (opacity + scale: 0.95 → 1)

**Usage Patterns**:

```typescript
// Page entrance animations (use initial/animate, not whileInView)
import { motion } from "framer-motion";
import { fadeInUpVariants } from "@web/config/animations";

export function PageSection() {
  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Content */}
    </motion.div>
  );
}

// Scroll-triggered reveals (use whileInView for scroll-based)
export function ScrollSection() {
  return (
    <motion.div
      variants={fadeInUpVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      {/* Content */}
    </motion.div>
  );
}
```

**Guidelines**:

- ✅ Use shared variants from `@web/config/animations` (centralised)
- ✅ Use `initial="hidden"` and `animate="visible"` for page entrance animations
- ✅ Use `whileInView="visible"` with `viewport={{ once: true }}` for scroll-triggered animations
- ✅ Keep hover states as CSS transitions (Tailwind `transition-*`)
- ✅ Use CSS keyframes for infinite/background animations
- ❌ Avoid inline animation definitions (use shared variants)

**When to Use CSS vs Motion**:

| Use Case | Recommendation |
|----------|----------------|
| Scroll-triggered reveals | Motion (`whileInView`) |
| Entrance animations | Motion (`initial`/`animate`) |
| Staggered lists | Motion (`staggerChildren`) |
| Hover states | CSS (Tailwind `transition-*`) |
| Infinite loops | CSS keyframes |

See `framer-motion-animations` skill for detailed patterns and migration guidance.

### Typography System

A modern, semantic typography system for consistent visual hierarchy across the application.

**Design Philosophy**:

- Lighter font weights relying on size and spacing for hierarchy
- Inspired by Vercel, Linear, and Stripe design systems
- Principles: Semibold (600) for primary headings, Medium (500) for secondary headings/labels, Normal (400) for body
  text
- Bold reserved for data emphasis (numbers, metrics)
- **HeroUI Semantic Colours**: All components include default theme-adaptive colours that can be overridden via
  `className`

**Component Reference**:

**Headings**:

- `Typography.H1`: Page titles, primary headings (font-semibold text-4xl text-foreground lg:text-5xl)
- `Typography.H2`: Section titles, major sections (font-semibold text-3xl text-foreground)
- `Typography.H3`: Subsection titles, card titles (font-medium text-2xl text-foreground)
- `Typography.H4`: Small headings, nested sections (font-medium text-xl text-default-900)

**Body Text**:

- `Typography.TextLg`: Large body text, lead paragraphs (text-lg text-foreground leading-relaxed)
- `Typography.Text`: Standard body text, paragraphs (text-base text-foreground leading-7)
- `Typography.TextSm`: Small body text, secondary descriptions (text-sm text-default-600 leading-6)

**UI Labels**:

- `Typography.Label`: Form labels, navigation items, tabs (font-medium text-sm text-foreground)
- `Typography.Caption`: Metadata text, timestamps, footnotes (text-xs text-default-500 leading-tight)

**Content Elements** (legacy, for backward compatibility):

- `Typography.P`: Paragraphs with bottom margin (not-first:mt-6)
- `Typography.Blockquote`: Quoted text with left border
- `Typography.List`: Unordered lists with disc markers
- `Typography.InlineCode`: Inline code snippets (font-medium monospace)
- `Typography.Lead`: Lead paragraphs (text-xl text-default-500)

**Usage Examples**:

```tsx
import Typography from "@web/components/typography";

// Page heading
<Typography.H1>COE Overview</Typography.H1>

// Section heading
<Typography.H2>Fun Facts</Typography.H2>

// Card title
<Typography.H3>Category A vs B</Typography.H3>

// Lead paragraph
<Typography.TextLg>Explore COE trends and analysis.</Typography.TextLg>

// Body text
<Typography.Text>The latest COE results show...</Typography.Text>

// Small helper text
<Typography.TextSm>Updated daily from LTA</Typography.TextSm>

// Form label
<Typography.Label>Select Month</Typography.Label>

// Metadata/timestamp
<Typography.Caption>Last updated: 29 Oct 2025</Typography.Caption>
```

**When to Use Each Component**:

- Use `H1` for exactly one primary page title
- Use `H2` for major section groupings
- Use `H3` for card titles and subsections
- Use `H4` for nested section headers
- Use `TextLg` for introductions and emphasised content
- Use `Text` for standard body content and descriptions
- Use `TextSm` for secondary info and helper text
- Use `Label` for form fields and UI controls
- Use `Caption` for timestamps, sources, and footnotes

**HeroUI Semantic Colour System**:

All Typography components include default colours from HeroUI's semantic colour palette:

- `text-foreground`: Theme-adaptive primary text colour (auto-adjusts for light/dark mode)
- `text-default-900`: Darkest shade for strong emphasis (H4 headings)
- `text-default-600`: Medium shade for secondary text (TextSm for links, footer text)
- `text-default-500`: Muted colour for metadata and captions (Caption, Lead components)

These defaults provide proper visual hierarchy while allowing override via `className` prop when specific colours like
`text-primary` are needed for emphasis.

**Migration Notes**:

- Legacy components (`Small`, `Muted`) have been replaced with semantic alternatives (`Label`, `Caption`)
- Existing `P` component maintained for backward compatibility
- Removed border-bottom from `H2` for cleaner appearance
- Font weight reductions (H1/H2 remain semibold; H3/H4 changed to medium) for modern hierarchy
- All components now include HeroUI semantic colour defaults for consistent theming

**Enforcement Rules**:

- ✅ Always use `Typography.H4` for `Card.Header` titles (not raw `<h3>`)
- ✅ Always use `Typography.TextSm` for `Card.Header` descriptions (not raw `<p>`)
- ✅ Use `Typography.H2` for section headings in blog components
- ✅ Use `Typography.H3` for card titles and subsections
- ❌ Avoid raw heading tags (`<h1>`, `<h2>`, `<h3>`, `<h4>`) outside of MDX content
- ⚠️ Exception: Raw tags allowed only for MDX blog content and image overlay text

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

Dashboard pages use professional, SEO-aligned H1 titles that match the `<title>` tag for search engine consistency.

**Current Page Titles**:

| Page | Route | H1 |
|------|-------|-----|
| Homepage | `/` | Overview |
| Cars Hub | `/cars` | Cars |
| Car Registrations | `/cars/registrations` | Car Registrations |
| Fuel Types | `/cars/fuel-types` | Fuel Types |
| Vehicle Types | `/cars/vehicle-types` | Vehicle Types |
| COE Overview | `/coe` | COE Overview |
| COE Premiums | `/coe/premiums` | COE Premiums |
| COE PQP | `/coe/pqp` | PQP Rates |
| COE Results | `/coe/results` | COE Results |
| Annual | `/cars/annual` | Vehicle Population |
| Deregistrations | `/cars/deregistrations` | Vehicle Deregistrations |
| Makes | `/cars/makes` | Makes |

<details>
<summary><strong>Archive: Playful Titles (for future reference)</strong></summary>

Previously used playful label + H1 pattern for a friendlier, stats-focused experience:

| Page | Route | Label | H1 |
|------|-------|-------|-----|
| Homepage | `/` | Welcome | What's Trending |
| Car Registrations | `/cars/registrations` | This Month | What Got Registered |
| Fuel/Vehicle Types | `/cars/fuel-types`, `/cars/vehicle-types` | The Breakdown | What's Popular? |
| COE Overview | `/coe` | Latest Results | How Much This Round? |
| COE Premiums | `/coe/premiums` | Premium Tracker | What's the Premium? |
| COE PQP | `/coe/pqp` | Extend Your COE | How Much to Stay on the Road? |
| COE Results | `/coe/results` | Past Rounds | What Did People Pay? |
| Annual | `/cars/annual` | Year in Review | Trends Over Time |
| Deregistrations | `/cars/deregistrations` | Outflow Stats | Who's Leaving? |
| Makes | `/cars/makes` | Brand Rankings | Who's on Top |

**Design Principles** (if re-enabling):
- **Label**: Short context (timing, category, or data type)
- **H1**: Playful question or statement that invites exploration
- **Tone**: Stats/data-focused, not shopping guide
- **Voice**: Friendly, like catching up on the latest data

</details>

### Layout & Spacing Conventions

A standardized approach to spacing and layout for consistent, maintainable component design.

**Design Philosophy**:

- Modern flexbox/grid-based layouts with gap utilities
- Predictable spacing without margin collapsing issues
- Consistent even-numbered spacing scale
- Avoid legacy margin-based spacing patterns

**Vertical Spacing Best Practices**:

- **Avoid `space-y-*`**: Use `flex flex-col gap-*` instead for better layout control
- **Avoid `margin-top`**: Use `gap-*` or `padding` for spacing between elements
- **Prefer even gap values**: `gap-2`, `gap-4`, `gap-6`, `gap-8` (odd values like `gap-1` only sparingly for specific
  cases)

**Guidelines**:

- ✅ Use `flex flex-col gap-*` for vertical spacing in containers
- ✅ Use `gap-*` for both horizontal and vertical spacing in flex/grid layouts
- ✅ Use `padding` for internal component spacing
- ✅ Prefer even gap values for consistency: `gap-2` (0.5rem), `gap-4` (1rem), `gap-6` (1.5rem), `gap-8` (2rem)
- ❌ Avoid `space-y-*` utilities (creates margin-based spacing with potential collapsing issues)
- ❌ Avoid `mt-*`/`margin-top` for spacing between sibling elements (use `gap-*` instead)
- ⚠️ Exception: `mt-*` acceptable only for icon alignment with text (e.g., `mt-1` for small icons)

**Rationale**: `gap-*` provides more predictable spacing in modern layouts, works consistently with flexbox/grid, and
avoids margin collapsing issues that can occur with `space-y-*` and `margin-top`.

**Examples**:

```tsx
// ✅ Preferred: flex with gap for vertical spacing
<div className="flex flex-col gap-4">
  <CardComponent />
  <CardComponent />
  <CardComponent />
</div>

// ✅ Grid with even gap values
<div className="grid grid-cols-2 gap-6">
  <Item />
  <Item />
</div>

// ✅ Horizontal flex with gap
<div className="flex items-center gap-2">
  <Icon className="size-4" />
  <span>Text content</span>
</div>

// ❌ Avoid: space-y utilities (legacy pattern)
<div className="space-y-4">
  <CardComponent />
  <CardComponent />
</div>

// ❌ Avoid: margin-top for sibling spacing
<div>
  <CardComponent />
  <CardComponent className="mt-4" />
</div>

// ⚠️ Acceptable exception: icon vertical alignment
<div className="flex items-center gap-2">
  <Icon className="mt-1 size-4" />
  <span className="text-sm">Aligned text</span>
</div>
```

**Spacing Scale Reference**:

- `gap-1` (0.25rem / 4px) - Tight spacing, use sparingly
- `gap-2` (0.5rem / 8px) - Small spacing, compact lists
- `gap-4` (1rem / 16px) - Standard spacing, most common use
- `gap-6` (1.5rem / 24px) - Medium spacing, section groups
- `gap-8` (2rem / 32px) - Large spacing, major sections

**Migration from Legacy Patterns**:

When refactoring existing code:

1. Replace `<div className="space-y-4">` with `<div className="flex flex-col gap-4">`
2. Remove `mt-*` from child elements when parent uses `gap-*`
3. Convert `space-y-*` values to equivalent `gap-*` (space-y-2 → gap-2, space-y-4 → gap-4, etc.)
4. Keep only icon alignment `mt-*` cases (document with comments if needed)

### Colour System

A professional colour scheme optimised for HeroUI integration and automotive industry data visualisation (see GitHub issue #406). See `design-language-system` skill for comprehensive colour guidelines, chart implementation patterns, and migration checklists.

**Dark Mode**: Dark CSS variables are defined in `@motormetrics/theme/dark.css`, imported by `globals.css`. Use HeroUI surface tokens such as `bg-surface` and `bg-surface-secondary` instead of hardcoded `bg-white` for card/panel backgrounds.

**Brand Colour Palette**:

| Role | Colour | Hex | HSL | Usage |
|------|-------|-----|-----|-------|
| Primary | Navy Blue | `#191970` | `hsl(240, 63%, 27%)` | Headers, footers, primary buttons, key accents |
| Secondary | Slate Gray | `#708090` | `hsl(210, 13%, 50%)` | Card containers, borders, secondary buttons |
| Accent | Cyan | `#00FFFF` | `hsl(180, 100%, 50%)` | Chart highlights, links, hover states |
| Background | Powder Blue | `#B0E0E6` | `hsl(187, 52%, 80%)` | Chart areas, subtle textures |
| Text | Dark Slate Gray | `#2F4F4F` | `hsl(180, 25%, 25%)` | Body text, icons |

**CSS Variable Mapping**:

Base runtime tokens live in `@motormetrics/theme/light.css` and `@motormetrics/theme/dark.css`. `globals.css` bridges those tokens into Tailwind v4 utility classes with `@theme inline`, so utilities like `bg-primary`, `text-default-500`, `bg-surface`, and `border-default-200` resolve to the active theme values.

```css
@theme inline {
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-surface: var(--surface);
  --color-default-500: var(--default-500);
}
```

**Semantic Colour Usage**:

- `text-primary` / `bg-primary` - Navy Blue for brand elements
- `text-foreground` - Dark Slate Gray for body text
- `text-default-900` - Strong emphasis (H4 headings)
- `text-default-600` - Secondary text (TextSm)
- `text-default-500` - Captions/metadata

**Opacity Scale**:

- `text-foreground/60` - Secondary text
- `text-foreground/40` - Muted text
- ⚠️ Reserve `text-white` only for image overlays

**Chart Colours (Navy Blue Gradient Palette)**:

CSS variables `--chart-1` through `--chart-6` define the chart colour palette:

| Variable | Colour | Hex | Usage |
|----------|--------|-----|-------|
| `--chart-1` | Navy Blue | `#191970` | Primary/top ranking |
| `--chart-2` | Medium Blue | `#2E4A8E` | Second ranking |
| `--chart-3` | Light Blue | `#4A6AAE` | Third ranking |
| `--chart-4` | Slate Gray | `#708090` | Fourth ranking |
| `--chart-5` | Light Slate | `#94A3B8` | Fifth ranking |
| `--chart-6` | Pale Slate | `#B8C4CE` | Sixth ranking |

**Chart Implementation Guidelines**:

- **Multi-series charts**: Use `var(--chart-N)` for each series (e.g., bars use gradient colours based on ranking)
- **Single-highlight charts**: Use `var(--chart-1)` for highlighted element, `bg-default-200` for others
- **Recharts Cell colouring**: Use index-based `fill={`var(--chart-${index + 1})`}` for per-bar colours
- Avoid hardcoded hex values; always use CSS variables

**Accessibility Requirements (WCAG AA)**:

- Normal text: Minimum 4.5:1 contrast ratio
- Large text: Minimum 3:1 contrast ratio
- Interactive elements: Minimum 3:1 for focus indicators
- Information must not be conveyed by colour alone

### Modern Dashboard Design

A pill-based, sidebar-free design system for professional automotive analytics dashboards.

**Design Principles**:

- No sidebar - horizontal navigation only
- Pill-shaped interactive elements (`rounded-full`)
- Large rounded cards (`rounded-2xl` or `rounded-3xl`)
- Professional automotive industry aesthetic
- Generous whitespace and grid-based layouts

**Navigation Style**:

```tsx
// Horizontal pill tab navigation
<div className="flex items-center gap-2 rounded-full border p-1">
  <Button className="rounded-full" color="primary">Dashboard</Button>
  <Button className="rounded-full" variant="light">Calendar</Button>
  <Button className="rounded-full" variant="light">Projects</Button>
</div>
```

- Active tab: `bg-primary text-primary-foreground rounded-full`
- Inactive tabs: `rounded-full` with `variant="light"` or `border`
- Tab group container with subtle border

**Card Design**:

- Use HeroUI Card defaults for base radius, padding, background, and shadow
- Add custom shadows, borders, or backgrounds only when they communicate hierarchy
- Use explicit `Card.Content` padding only for intentional edge-to-edge or specialised layouts
- Optional coloured accent borders or backgrounds

```tsx
<Card>
  <Card.Header className="flex flex-col items-start gap-2">
    <Typography.H4>Card Title</Typography.H4>
    <Typography.TextSm>Description</Typography.TextSm>
  </Card.Header>
  <Card.Content>{/* Content */}</Card.Content>
</Card>
```

**Button Styles**:

- ✅ Pill-shaped: `rounded-full` for all buttons
- Primary: `color="primary"` with filled background
- Secondary: `variant="bordered"` with outline
- Icon buttons: Circular with `rounded-full`

**Status Badges/Chips**:

```tsx
<Chip className="rounded-full" color="success" size="sm">
  <span className="mr-1">●</span> Done
</Chip>
<Chip className="rounded-full" color="warning" size="sm">
  <span className="mr-1">●</span> Waiting
</Chip>
<Chip className="rounded-full" color="danger" size="sm">
  <span className="mr-1">●</span> Failed
</Chip>
```

**Metrics Display**:

- Large bold numbers for primary values
- Small percentage change indicators with up/down arrows
- Subtle background cards for metric groups

```tsx
<div className="flex flex-col gap-1">
  <Typography.Caption>Total Registrations</Typography.Caption>
  <div className="flex items-baseline gap-2">
    <span className="font-bold text-3xl">46,500</span>
    <Chip className="rounded-full" color="success" size="sm">+2.5%</Chip>
  </div>
</div>
```

**Data Visualisation**:

- Dot matrix charts for activity/heatmaps
- Soft curved progress bars (not sharp rectangles)
- Donut/ring charts over pie charts
- Muted colour palettes with one accent colour

**Layout Principles**:

- Grid-based card layout: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Generous whitespace between sections: `gap-8` or `gap-10`
- Breadcrumb navigation for hierarchy
- Horizontal scrolling tabs for mobile

### Blog Features

**Content Management**:

- AI-generated blog posts from LLM analysis of market data
- MDX rendering with GitHub Flavored Markdown support
- Dynamic Open Graph image generation for social sharing
- SEO-optimised metadata with structured data

**Reader Experience**:

- Reading progress bar with smooth animations
- Estimated reading time calculations
- View counter with privacy-focused Redis tracking
- Related posts based on content tags and topics

**Technical Implementation**:

- Static generation with ISR for optimal performance
- Custom MDX components for enhanced formatting
- Automatic table of contents generation
- Responsive design with mobile-first approach

**SEO & Social**:

- Dynamic Open Graph images for each blog post
- JSON-LD structured data for search engines
- Canonical URLs and social media meta tags
- Automatic sitemap integration

### OpenGraph Images

Dynamic OG images for social media sharing using Next.js `ImageResponse` API. See `opengraph-images` skill for detailed implementation patterns.

**File Locations**:

| File | Type | Purpose |
|------|------|---------|
| `src/app/opengraph-image.png` | Static | Homepage OG image |
| `src/app/about/opengraph-image.tsx` | Dynamic | About page with custom fonts |
| `src/app/blog/[slug]/opengraph-image.tsx` | Dynamic | Blog posts with dynamic titles |

**Standard Structure**:

OG images follow a three-part layout:

1. **Eyebrow chip** - Page context indicator (e.g., "Behind the Data", "Blog")
2. **Main headline** - Two lines with gradient text on second line
3. **Subheadline** - Supporting description text

**Required Exports**:

```typescript
export const alt = "Page Title - MotorMetrics";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
```

**Font Loading**:

Custom Geist fonts loaded from `assets/fonts/`:

```typescript
const [geistRegular, geistSemiBold, geistBold] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Geist-Regular.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-SemiBold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Geist-Bold.ttf")),
]);
```

**Eyebrow Text Guidelines**:

| Page Type | Eyebrow Text |
|-----------|--------------|
| Homepage | Singapore Car Market Data |
| About | Behind the Data |
| Blog Post | Blog / Analysis / Insights |
| COE | COE Bidding Results |
| Cars | Vehicle Registrations |

**Important Constraints**:

- Use inline `style` objects only (no CSS classes)
- Flexbox supported, Grid not supported
- Font files must be loaded explicitly (`.ttf`)
- Server-side only (no React hooks)

**Testing**: Visit `/about/opengraph-image` directly in browser, or use social debuggers (Facebook, Twitter, LinkedIn).

### Testing Strategy

**Unit Tests**: Co-located with components using Vitest and Testing Library. Run tests before commits.

**Test Naming Convention**: All test descriptions should start with "should" to describe expected behavior:

```typescript
// ✅ Good
it("should render title and children", () => {
});
it("should display empty state when data is empty", () => {
});

// ❌ Avoid
it("renders title and children", () => {
});
it("displays empty state when data is empty", () => {
});
```

**E2E Tests**: Playwright tests in `tests/` directory covering critical user flows.

**Coverage**: Generate coverage reports with `pnpm test:coverage`.

### Environment Configuration

Environment variables managed through Vercel project settings:

- `DATABASE_URL`: Neon PostgreSQL connection
- `UPSTASH_REDIS_REST_URL/TOKEN`: Redis caching
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob storage access for car logos (via `@motormetrics/logos`)
- `MOTORMETRICS_API_TOKEN`: External API authentication
- `CRON_SECRET`: Auto-provisioned by Vercel; authenticates cron requests via `Authorization: Bearer <CRON_SECRET>`. Workflow `GET` handlers validate this header
- `NEXT_PUBLIC_FEATURE_FLAG_UNRELEASED`: Feature flag for unreleased features
- `VERCEL_ENV`: Vercel's automatic environment detection (production/preview/development)

#### Production Environment Detection

Production detection uses Vercel's automatic `VERCEL_ENV` variable:

- Social media redirects and production-only features activate when `VERCEL_ENV === "production"`

#### VERCEL_URL Support

The application supports Vercel's automatic URL environment variables:

- `NEXT_PUBLIC_VERCEL_URL`: Client-side deployment URL (e.g., `my-site.vercel.app`) without `https://` protocol
- `SITE_URL` configuration automatically uses `NEXT_PUBLIC_VERCEL_URL` when `NEXT_PUBLIC_SITE_URL` is not set

#### Vercel Related Projects Integration

The web application uses Vercel Related Projects for automatic API URL resolution:

**Configuration:**

- Located in `vercel.ts` at the web app root
- References API project ID: `prj_fyAvupEssH3LO4OQFDWplinVFlaI`
- Uses `@vercel/related-projects` package for dynamic URL resolution

**Implementation:**

- API URL automatically resolved via `withRelatedProject()` in `src/config/index.ts`
- Works across all environments: dev, staging, production, and preview deployments
- Falls back to `NEXT_PUBLIC_API_URL` or default `https://api.motormetrics.app` if Related Projects unavailable

**Benefits:**

- No manual API URL configuration needed in Vercel deployments
- Preview deployments automatically connect to correct API environment
- Type-safe with full TypeScript support
- Works seamlessly with Vercel deployments

### Deployment

Deployed via Vercel with automatic deployments:

- **Production**: `motormetrics.app` (apex domain) - deployed on push to main
- **Preview**: Automatic preview URLs for pull requests

## Development Notes

- **Package Manager**: Uses pnpm v11.0.0
- **TypeScript**: Strict mode enabled
- **Turbopack**: Enabled for faster builds and development
- **Feature Flags**: Controlled via `NEXT_PUBLIC_FEATURE_FLAG_UNRELEASED`
- **Analytics**: Integrated with Umami analytics

## UI Component Strategy

The codebase has consolidated on **HeroUI as the primary component library**:

- **UI Components**: Use HeroUI v3 components imported from `@heroui/react`
- **Chart Components**: Use local Recharts wrappers from `@web/components/charts/chart`
- **Component Selection**: Leverage HeroUI's professional design system for analytics interfaces, tables, forms, and navigation
- **Customisation**: Apply HeroUI v3 CSS variables and `@motormetrics/theme` tokens to match Singapore car market branding
- **Performance**: Take advantage of HeroUI's tree-shakeable, optimised components
- **Migration Complete**: shadcn/ui has been removed; HeroUI v3 and local chart wrappers are the UI foundation

<!-- HEROUI-REACT-AGENTS-MD-START -->
[HeroUI React v3 Docs Index]|root: ./.heroui-docs/react|STOP. What you remember about HeroUI React v3 is WRONG for this project. Always search docs and read before any task.|If docs missing, run this command first: heroui agents-md --react --output AGENTS.md|components/(buttons):{button-group.mdx,button.mdx,close-button.mdx,toggle-button-group.mdx,toggle-button.mdx}|components/(collections):{dropdown.mdx,list-box.mdx,tag-group.mdx}|components/(colors):{color-area.mdx,color-field.mdx,color-picker.mdx,color-slider.mdx,color-swatch-picker.mdx,color-swatch.mdx}|components/(controls):{slider.mdx,switch.mdx}|components/(data-display):{badge.mdx,chip.mdx,table.mdx}|components/(date-and-time):{calendar.mdx,date-field.mdx,date-picker.mdx,date-range-picker.mdx,range-calendar.mdx,time-field.mdx}|components/(feedback):{alert.mdx,meter.mdx,progress-bar.mdx,progress-circle.mdx,skeleton.mdx,spinner.mdx}|components/(forms):{checkbox-group.mdx,checkbox.mdx,description.mdx,error-message.mdx,field-error.mdx,fieldset.mdx,form.mdx,input-group.mdx,input-otp.mdx,input.mdx,label.mdx,number-field.mdx,radio-group.mdx,search-field.mdx,text-area.mdx,text-field.mdx}|components/(layout):{card.mdx,separator.mdx,surface.mdx,toolbar.mdx}|components/(media):{avatar.mdx}|components/(navigation):{accordion.mdx,breadcrumbs.mdx,disclosure-group.mdx,disclosure.mdx,link.mdx,pagination.mdx,tabs.mdx}|components/(overlays):{alert-dialog.mdx,drawer.mdx,modal.mdx,popover.mdx,toast.mdx,tooltip.mdx}|components/(pickers):{autocomplete.mdx,combo-box.mdx,select.mdx}|components/(typography):{kbd.mdx}|components/(utilities):{scroll-shadow.mdx}|getting-started/(handbook):{animation.mdx,colors.mdx,composition.mdx,styling.mdx,theming.mdx}|getting-started/(overview):{design-principles.mdx,quick-start.mdx}|getting-started/(ui-for-agents):{agent-skills.mdx,agents-md.mdx,llms-txt.mdx,mcp-server.mdx}|releases:{v3-0-0-alpha-32.mdx,v3-0-0-alpha-33.mdx,v3-0-0-alpha-34.mdx,v3-0-0-alpha-35.mdx,v3-0-0-beta-1.mdx,v3-0-0-beta-2.mdx,v3-0-0-beta-3.mdx,v3-0-0-beta-4.mdx,v3-0-0-beta-6.mdx,v3-0-0-beta-7.mdx,v3-0-0-beta-8.mdx,v3-0-0-rc-1.mdx,v3-0-0.mdx,v3-0-2.mdx,v3-0-3.mdx}|demos/accordion:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-render-function.tsx,custom-styles.tsx,disabled.tsx,faq.tsx,multiple.tsx,surface.tsx,without-separator.tsx}|demos/alert-dialog:{backdrop-variants.tsx,close-methods.tsx,controlled.tsx,custom-animations.tsx,custom-backdrop.tsx,custom-icon.tsx,custom-portal.tsx,custom-trigger.tsx,default.tsx,dismiss-behavior.tsx,placements.tsx,sizes.tsx,statuses.tsx,with-close-button.tsx}|demos/alert:{basic.tsx}|demos/autocomplete:{allows-empty-collection.tsx,asynchronous-filtering.tsx,controlled-open-state.tsx,controlled.tsx,custom-indicator.tsx,default.tsx,disabled.tsx,email-recipients.tsx,full-width.tsx,location-search.tsx,multiple-select.tsx,required.tsx,single-select.tsx,tag-group-selection.tsx,user-selection-multiple.tsx,user-selection.tsx,variants.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/avatar:{basic.tsx,colors.tsx,custom-styles.tsx,fallback.tsx,group.tsx,sizes.tsx,variants.tsx}|demos/badge:{basic.tsx,colors.tsx,dot.tsx,placements.tsx,sizes.tsx,variants.tsx,with-content.tsx}|demos/breadcrumbs:{basic.tsx,custom-render-function.tsx,custom-separator.tsx,disabled.tsx,level-2.tsx,level-3.tsx}|demos/button-group:{basic.tsx,disabled.tsx,full-width.tsx,orientation.tsx,sizes.tsx,variants.tsx,with-icons.tsx,without-separator.tsx}|demos/button:{basic.tsx,custom-render-function.tsx,custom-variants.tsx,disabled.tsx,full-width.tsx,icon-only.tsx,loading-state.tsx,loading.tsx,outline-variant.tsx,ripple-effect.tsx,sizes.tsx,social.tsx,variants.tsx,with-icons.tsx}|demos/calendar:{basic.tsx,booking-calendar.tsx,controlled.tsx,custom-icons.tsx,custom-styles.tsx,default-value.tsx,disabled.tsx,focused-value.tsx,international-calendar.tsx,min-max-dates.tsx,multiple-months.tsx,read-only.tsx,unavailable-dates.tsx,with-indicators.tsx,year-picker.tsx}|demos/card:{default.tsx,horizontal.tsx,variants.tsx,with-avatar.tsx,with-form.tsx,with-images.tsx}|demos/checkbox-group:{basic.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,features-and-addons.tsx,indeterminate.tsx,on-surface.tsx,validation.tsx,with-custom-indicator.tsx}|demos/checkbox:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-render-function.tsx,custom-styles.tsx,default-selected.tsx,disabled.tsx,form.tsx,full-rounded.tsx,indeterminate.tsx,invalid.tsx,render-props.tsx,variants.tsx,with-description.tsx,with-label.tsx}|demos/chip:{basic.tsx,statuses.tsx,variants.tsx,with-icon.tsx}|demos/close-button:{default.tsx,interactive.tsx,variants.tsx,with-custom-icon.tsx}|demos/color-area:{basic.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,space-and-channels.tsx,with-dots.tsx}|demos/color-field:{basic.tsx,channel-editing.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,form-example.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,required.tsx,variants.tsx,with-description.tsx}|demos/color-picker:{basic.tsx,controlled.tsx,with-fields.tsx,with-sliders.tsx,with-swatches.tsx}|demos/color-slider:{alpha-channel.tsx,basic.tsx,channels.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,rgb-channels.tsx,vertical.tsx}|demos/color-swatch-picker:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-render-function.tsx,default-value.tsx,disabled.tsx,sizes.tsx,stack-layout.tsx,variants.tsx}|demos/color-swatch:{accessibility.tsx,basic.tsx,custom-render-function.tsx,custom-styles.tsx,shapes.tsx,sizes.tsx,transparency.tsx}|demos/combo-box:{allows-custom-value.tsx,asynchronous-loading.tsx,controlled-input-value.tsx,controlled.tsx,custom-filtering.tsx,custom-indicator.tsx,custom-render-function.tsx,custom-value.tsx,default-selected-key.tsx,default.tsx,disabled.tsx,full-width.tsx,menu-trigger.tsx,on-surface.tsx,required.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/date-field:{basic.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,form-example.tsx,full-width.tsx,granularity.tsx,invalid.tsx,on-surface.tsx,required.tsx,variants.tsx,with-description.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-validation.tsx}|demos/date-picker:{basic.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,form-example.tsx,format-options-no-ssr.tsx,format-options.tsx,international-calendar.tsx,with-custom-indicator.tsx,with-validation.tsx}|demos/date-range-picker:{basic.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,form-example.tsx,format-options-no-ssr.tsx,format-options.tsx,input-container.tsx,international-calendar.tsx,with-custom-indicator.tsx,with-validation.tsx}|demos/description:{basic.tsx}|demos/disclosure-group:{basic.tsx,controlled.tsx}|demos/disclosure:{basic.tsx,custom-render-function.tsx}|demos/drawer:{backdrop-variants.tsx,basic.tsx,controlled.tsx,navigation.tsx,non-dismissable.tsx,placements.tsx,scrollable-content.tsx,with-form.tsx}|demos/dropdown:{controlled-open-state.tsx,controlled.tsx,custom-trigger.tsx,default.tsx,long-press-trigger.tsx,single-with-custom-indicator.tsx,with-custom-submenu-indicator.tsx,with-descriptions.tsx,with-disabled-items.tsx,with-icons.tsx,with-keyboard-shortcuts.tsx,with-multiple-selection.tsx,with-section-level-selection.tsx,with-sections.tsx,with-single-selection.tsx,with-submenus.tsx}|demos/error-message:{basic.tsx,with-tag-group.tsx}|demos/field-error:{basic.tsx}|demos/fieldset:{basic.tsx,on-surface.tsx}|demos/form:{basic.tsx,custom-render-function.tsx}|demos/input-group:{default.tsx,disabled.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,password-with-toggle.tsx,required.tsx,variants.tsx,with-badge-suffix.tsx,with-copy-suffix.tsx,with-icon-prefix-and-copy-suffix.tsx,with-icon-prefix-and-text-suffix.tsx,with-keyboard-shortcut.tsx,with-loading-suffix.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-text-prefix.tsx,with-text-suffix.tsx,with-textarea.tsx}|demos/input-otp:{basic.tsx,controlled.tsx,disabled.tsx,form-example.tsx,four-digits.tsx,on-complete.tsx,on-surface.tsx,variants.tsx,with-pattern.tsx,with-validation.tsx}|demos/input:{basic.tsx,controlled.tsx,full-width.tsx,on-surface.tsx,types.tsx,variants.tsx}|demos/kbd:{basic.tsx,inline.tsx,instructional.tsx,navigation.tsx,special.tsx,variants.tsx}|demos/label:{basic.tsx}|demos/link:{basic.tsx,custom-icon.tsx,custom-render-function.tsx,icon-placement.tsx,underline-and-offset.tsx,underline-offset.tsx,underline-variants.tsx}|demos/list-box:{controlled.tsx,custom-check-icon.tsx,custom-render-function.tsx,default.tsx,multi-select.tsx,virtualization.tsx,with-disabled-items.tsx,with-sections.tsx}|demos/meter:{basic.tsx,colors.tsx,custom-value.tsx,sizes.tsx,without-label.tsx}|demos/modal:{backdrop-variants.tsx,close-methods.tsx,controlled.tsx,custom-animations.tsx,custom-backdrop.tsx,custom-portal.tsx,custom-trigger.tsx,default.tsx,dismiss-behavior.tsx,placements.tsx,scroll-comparison.tsx,sizes.tsx,with-form.tsx}|demos/number-field:{basic.tsx,controlled.tsx,custom-icons.tsx,custom-render-function.tsx,disabled.tsx,form-example.tsx,full-width.tsx,on-surface.tsx,required.tsx,validation.tsx,variants.tsx,with-chevrons.tsx,with-description.tsx,with-format-options.tsx,with-step.tsx,with-validation.tsx}|demos/pagination:{basic.tsx,controlled.tsx,custom-icons.tsx,disabled.tsx,simple-prev-next.tsx,sizes.tsx,with-ellipsis.tsx,with-summary.tsx}|demos/popover:{basic.tsx,custom-render-function.tsx,interactive.tsx,placement.tsx,with-arrow.tsx}|demos/progress-bar:{basic.tsx,colors.tsx,custom-value.tsx,indeterminate.tsx,sizes.tsx,without-label.tsx}|demos/progress-circle:{basic.tsx,colors.tsx,custom-svg.tsx,indeterminate.tsx,sizes.tsx,with-label.tsx}|demos/radio-group:{basic.tsx,controlled.tsx,custom-indicator.tsx,custom-render-function.tsx,delivery-and-payment.tsx,disabled.tsx,horizontal.tsx,on-surface.tsx,uncontrolled.tsx,validation.tsx,variants.tsx}|demos/range-calendar:{allows-non-contiguous-ranges.tsx,basic.tsx,booking-calendar.tsx,controlled.tsx,default-value.tsx,disabled.tsx,focused-value.tsx,international-calendar.tsx,invalid.tsx,min-max-dates.tsx,multiple-months.tsx,read-only.tsx,three-months.tsx,unavailable-dates.tsx,with-indicators.tsx,year-picker.tsx}|demos/scroll-shadow:{custom-size.tsx,default.tsx,hide-scroll-bar.tsx,orientation.tsx,visibility-change.tsx,with-card.tsx}|demos/search-field:{basic.tsx,controlled.tsx,custom-icons.tsx,custom-render-function.tsx,disabled.tsx,form-example.tsx,full-width.tsx,on-surface.tsx,required.tsx,validation.tsx,variants.tsx,with-description.tsx,with-keyboard-shortcut.tsx,with-validation.tsx}|demos/select:{asynchronous-loading.tsx,controlled-multiple.tsx,controlled-open-state.tsx,controlled.tsx,custom-indicator.tsx,custom-render-function.tsx,custom-value-multiple.tsx,custom-value.tsx,default.tsx,disabled.tsx,full-width.tsx,multiple-select.tsx,on-surface.tsx,required.tsx,variants.tsx,with-description.tsx,with-disabled-options.tsx,with-sections.tsx}|demos/separator:{basic.tsx,custom-render-function.tsx,manual-variant-override.tsx,variants.tsx,vertical.tsx,with-content.tsx,with-surface.tsx}|demos/skeleton:{animation-types.tsx,basic.tsx,card.tsx,grid.tsx,list.tsx,single-shimmer.tsx,text-content.tsx,user-profile.tsx}|demos/slider:{custom-render-function.tsx,default.tsx,disabled.tsx,range.tsx,vertical.tsx}|demos/spinner:{basic.tsx,colors.tsx,sizes.tsx}|demos/surface:{variants.tsx}|demos/switch:{basic.tsx,controlled.tsx,custom-render-function.tsx,custom-styles.tsx,default-selected.tsx,disabled.tsx,form.tsx,group-horizontal.tsx,group.tsx,label-position.tsx,render-props.tsx,sizes.tsx,with-description.tsx,with-icons.tsx,without-label.tsx}|demos/table:{async-loading.tsx,basic.tsx,column-resizing.tsx,custom-cells.tsx,empty-state.tsx,expandable-rows.tsx,pagination.tsx,secondary-variant.tsx,selection.tsx,sorting.tsx,tanstack-table.tsx,virtualization.tsx}|demos/tabs:{basic.tsx,custom-render-function.tsx,custom-styles.tsx,disabled.tsx,secondary-vertical.tsx,secondary.tsx,vertical.tsx,with-separator.tsx}|demos/tag-group:{basic.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,selection-modes.tsx,sizes.tsx,variants.tsx,with-error-message.tsx,with-list-data.tsx,with-prefix.tsx,with-remove-button.tsx}|demos/textarea:{basic.tsx,controlled.tsx,full-width.tsx,on-surface.tsx,rows.tsx,variants.tsx}|demos/textfield:{basic.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,full-width.tsx,input-types.tsx,on-surface.tsx,required.tsx,textarea.tsx,validation.tsx,with-description.tsx,with-error.tsx}|demos/time-field:{basic.tsx,controlled.tsx,custom-render-function.tsx,disabled.tsx,form-example.tsx,full-width.tsx,invalid.tsx,on-surface.tsx,required.tsx,with-description.tsx,with-prefix-and-suffix.tsx,with-prefix-icon.tsx,with-suffix-icon.tsx,with-validation.tsx}|demos/toast:{callbacks.tsx,custom-indicator.tsx,custom-queue.tsx,custom-toast.tsx,default.tsx,placements.tsx,promise.tsx,simple.tsx,variants.tsx}|demos/toggle-button-group:{attached.tsx,basic.tsx,controlled.tsx,disabled.tsx,full-width.tsx,orientation.tsx,selection-mode.tsx,sizes.tsx,without-separator.tsx}|demos/toggle-button:{basic.tsx,controlled.tsx,disabled.tsx,icon-only.tsx,sizes.tsx,variants.tsx}|demos/toolbar:{basic.tsx,custom-styles.tsx,vertical.tsx,with-button-group.tsx}|demos/tooltip:{basic.tsx,custom-render-function.tsx,custom-trigger.tsx,placement.tsx,with-arrow.tsx}
<!-- HEROUI-REACT-AGENTS-MD-END -->
