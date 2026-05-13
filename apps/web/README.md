# MotorMetrics

A comprehensive analytics platform for Singapore's car market, providing insights into car registrations, COE (
Certificate of Entitlement) bidding results, and market trends.

## Features

- **Car Registration Analytics**: Track registrations by make, fuel type, and vehicle type
- **COE Bidding Results**: Monitor COE premiums and bidding trends
- **Trend Analysis**: Month-over-month and year-over-year comparisons
- **Interactive Charts**: Responsive data visualisation with Recharts
- **Geographic Insights**: User analytics by location
- **Performance Optimization**: Next.js 16 Cache Components with `"use cache"` directives for optimal data fetching

## Tech Stack

- **Next.js 16** with App Router, React 19, and Cache Components
- **TypeScript** with strict type checking
- **Tailwind CSS v4** for styling
- **Drizzle ORM** with PostgreSQL (Neon Database)
- **Zustand** for state management
- **HeroUI** components with professional design system
- **Vitest** for unit testing, **Playwright** for E2E testing
- **Vercel** for deployment

## Getting Started

### Prerequisites

- Node.js >= 22
- pnpm 11.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd web

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run database migrations
pnpm migrate
```

### Development

```bash
# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Available Scripts

### Development
- `pnpm dev` - Start development server (uses Turbopack)
- `pnpm build` - Build for production (uses Turbopack)
- `pnpm start` - Start production server

### Testing
- `pnpm test` - Run unit tests with Vitest
- `pnpm test:run` - Run tests once
- `pnpm test:coverage` - Run unit tests with coverage
- `pnpm test:e2e` - Run E2E tests with Playwright
- `pnpm test:e2e:ui` - Run E2E tests with Playwright UI

### Code Quality
- `pnpm lint` - Run ESLint

### Database
- `pnpm migrate` - Run database migrations

## Project Structure

```
src/
├── app/                           # Next.js App Router - pages, layouts, API routes
│   ├── (main)/                   # Main site layout group
│   │   ├── (dashboard)/          # Data dashboard route group (cars, COE data)
│   │   │   ├── cars/             # Car data routes (registrations, fuel-types, etc.)
│   │   │   │   └── components/   # Cars route-specific components (co-located)
│   │   │   └── coe/              # COE data routes (results, premiums, pqp)
│   │   │       └── components/   # COE route-specific components (co-located)
│   │   ├── blog/                 # Blog routes
│   │   │   ├── actions/          # Blog-specific server actions (co-located)
│   │   │   └── components/       # Blog-specific components (co-located)
│   │   └── about/, faq/          # Static pages
│   ├── (social)/                 # Social media redirect routes with UTM tracking
│   ├── admin/                    # Admin interface for content management
│   ├── api/                      # API routes (analytics, OG images, revalidation)
│   └── store/                    # Zustand store slices
├── actions/                      # Server actions (maintenance tasks)
├── queries/                      # Data fetching queries (cars, COE, logos) with tests
├── components/                   # Shared React components
│   ├── coe/                      # Shared COE components
│   ├── dashboard/                # Shared dashboard components
│   └── shared/                   # Generic shared components
├── config/                       # App configuration (DB, Redis, navigation)
├── lib/                          # Shared data fetching and business logic
├── schema/                       # Drizzle database schemas
├── types/                        # TypeScript definitions
└── utils/                        # Utility functions with comprehensive tests
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting: `pnpm test:coverage && pnpm lint`
6. Submit a pull request

## Deployment

Automatic deployment via Vercel:

- **dev**: [dev.motormetrics.app](https://dev.motormetrics.app)
- **staging**: [staging.motormetrics.app](https://staging.motormetrics.app)
- **prod**: [motormetrics.app](https://motormetrics.app)

Production deployments run on Vercel from the main branch, with preview deployments generated for pull requests.

## Repo Activity

![Alt](https://repobeats.axiom.co/api/embed/a95b438e1fccbaeed2d9128859b7b13f6b6d531f.svg "Repobeats analytics image")
