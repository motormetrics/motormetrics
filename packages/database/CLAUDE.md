# MotorMetrics Database - Developer Reference Guide

## Package Overview

The `@motormetrics/database` package (v4.26.1) provides the database schema, types, and migration system for the MotorMetrics
platform. It uses Drizzle ORM v0.44.3 with PostgreSQL to manage:
 
- **Car Registration Data**: Monthly vehicle registration statistics by make, fuel type, and vehicle type
- **COE Bidding Results**: Certificate of Entitlement bidding data and Prevailing Quota Premium rates
- **Vehicle Deregistrations**: Monthly deregistration statistics by VQS category
- **Vehicle Population**: Annual vehicle population statistics by category and fuel type
- **Blog Posts**: LLM-generated blog content with metadata and SEO information

## Commands

### Schema Management

- **Generate migrations**: `pnpm generate` (creates migration files from schema changes using drizzle-kit)
- **Run migrations**: `pnpm migrate` (applies pending migrations to database using drizzle-kit)
- **Check migrations**: `pnpm migrate:check` (validates migration consistency using drizzle-kit)
- **Push schema**: `pnpm push` (push schema changes directly to database)
- **Drop database**: `pnpm drop` (drop database objects)

### Development Workflow

Modify schema → Generate migration → Apply to database → Verify consistency.
See `schema-design` skill for schema change workflows and migration best practices.

## File Structure

```
src/
├── schema/
│   ├── index.ts         # Main schema exports
│   ├── cars.ts          # Car registration table schema
│   ├── coe.ts           # COE bidding tables (coe, pqp)
│   ├── deregistration.ts # Vehicle deregistration table schema
│   ├── vehicle-population.ts # Vehicle population table schema
│   └── posts.ts         # Blog posts table schema
├── client.ts            # Drizzle client setup
├── index.ts             # Package entry point (re-exports schema & client)
├── drizzle.config.ts    # Drizzle configuration
└── migrations/          # Generated migration files
```

## Database Schema

### Naming Conventions

**Table names**: `snake_case` (e.g., `cars`, `coe`, `pqp`)
**Column names**: `camelCase` (e.g., `vehicleClass`, `biddingNo`, `fuelType`)
**Indexes**: Auto-generated names (no explicit naming required)

### Cars Table (`cars`)

Stores monthly vehicle registration data from LTA DataMall.

**Columns:**

- `id`: UUID primary key (auto-generated)
- `month`: Text, NOT NULL (YYYY-MM format, e.g., "2024-01")
- `make`: Text, NOT NULL (vehicle manufacturer, e.g., "Toyota", "BMW")
- `importerType`: Text (registration type)
- `fuelType`: Text, NOT NULL ("Petrol", "Diesel", "Electric", "Hybrid")
- `vehicleType`: Text, NOT NULL ("Cars", "Motor cycles", "Buses", etc.)
- `number`: Integer, default 0 (number of registrations)

**Indexes:**

- Compound index on `month` + `make` for efficient queries
- Individual indexes on `month`, `make`, `fuelType` for filtering
- Compound index on `make` + `fuelType` for combined filtering
- Index on `number` for registration volume sorting

### COE Tables

#### COE Bidding Results (`coe`)

Stores Certificate of Entitlement bidding exercise results.

**Columns:**

- `id`: UUID primary key (auto-generated)
- `month`: Text, NOT NULL (bidding month, YYYY-MM format)
- `biddingNo`: Integer (exercise number, 1 or 2)
- `vehicleClass`: Text, NOT NULL (COE category: "A", "B", "C", "D", "E")
- `quota`: Integer, default 0 (available certificates)
- `bidsSuccess`: Integer, default 0 (successful bids)
- `bidsReceived`: Integer, default 0 (total bids submitted)
- `premium`: Integer, default 0 (winning premium in SGD)

**Indexes:**

- Compound index on `month` + `vehicleClass`
- Individual index on `vehicleClass`
- Compound index on `month` + `biddingNo`
- Index on `premium` for sorting by price
- Compound index on `bidsSuccess` + `bidsReceived` for success rate analysis
- Descending compound index on `month`, `biddingNo`, `vehicleClass` for latest results

#### Prevailing Quota Premium (`pqp`)

Stores monthly PQP rates for immediate vehicle registration. Formerly named `coe_pqp`, renamed to `pqp` for clarity.

**Columns:**

- `id`: UUID primary key (auto-generated)
- `month`: Text, NOT NULL (month, YYYY-MM format)
- `vehicleClass`: Text, NOT NULL (COE category)
- `pqp`: Integer, default 0 (PQP rate in SGD)

**Indexes:**

- Compound index on `month` + `vehicleClass`
- Individual index on `vehicleClass`
- Index on `pqp` for sorting by rate

### Deregistrations Table (`deregistrations`)

Stores monthly vehicle deregistration data under the Vehicle Quota System (VQS) from LTA DataMall.

**Columns:**

- `id`: UUID primary key (auto-generated)
- `month`: Text, NOT NULL (YYYY-MM format, e.g., "2024-01")
- `category`: Text, NOT NULL (VQS category: "Category A", "Category B", "Category C", "Category D", "Vehicles Exempted From VQS", "Taxis")
- `number`: Integer, default 0 (number of deregistrations)

**Indexes:**

- Compound index on `month` + `category` for efficient queries
- Individual indexes on `month`, `category` for filtering
- Index on `number` for deregistration volume sorting

### Vehicle Population Table (`vehicle_population`)

Stores annual vehicle population data by category and fuel type from LTA DataMall.

**Columns:**

- `id`: UUID primary key (auto-generated)
- `year`: Text, NOT NULL (YYYY format, e.g., "2024")
- `category`: Text, NOT NULL (vehicle category, e.g., "Cars", "Taxis")
- `fuelType`: Text, NOT NULL ("Petrol", "Diesel", "Electric", "Petrol-Electric", etc.)
- `number`: Integer, default 0 (number of vehicles)

**Indexes:**

- Compound index on `year` + `category`
- Compound index on `year` + `fuelType`
- Individual indexes on `year`, `category`, `fuelType`

### Blog Posts (`posts`)

Stores LLM-generated blog content with structured output from AI generation.

**Columns:**

- `id`: UUID primary key (auto-generated)
- `title`: Text, NOT NULL (blog post title)
- `slug`: Text, NOT NULL, UNIQUE (URL-friendly identifier)
- `content`: Text, NOT NULL (Markdown content)
- `excerpt`: Text (2-3 sentence summary for meta description)
- `heroImage`: Text (Unsplash URL for blog post header)
- `tags`: Text[] (category tags in Title Case)
- `highlights`: JSONB (key statistics for visual display: value, label, detail)
- `status`: Text, default "draft" (publication status)
- `metadata`: JSONB (flexible metadata storage: LLM response info, token usage)
- `month`: Text (source data month, YYYY-MM format)
- `dataType`: Text (source data type: "cars" or "coe")
- `createdAt`: Timestamp, NOT NULL, default now() (creation date)
- `modifiedAt`: Timestamp, NOT NULL, default now() (last modification)
- `publishedAt`: Timestamp (publication date, nullable for drafts)

**Indexes:**

- Unique constraint on `slug` for URL routing
- Compound unique constraint on `month` + `dataType` to prevent duplicate posts

## TypeScript Integration

### Type Exports

Each schema file exports corresponding TypeScript types:

```typescript
// Insert types (for creating new records)
export type InsertCar = typeof cars.$inferInsert;
export type InsertCOE = typeof coe.$inferInsert;
export type InsertPqp = typeof pqp.$inferInsert;
export type InsertDeregistration = typeof deregistrations.$inferInsert;
export type InsertVehiclePopulation = typeof vehiclePopulation.$inferInsert;
export type InsertPost = typeof posts.$inferInsert;

// Select types (for query results)
export type SelectCar = typeof cars.$inferSelect;
export type SelectCOE = typeof coe.$inferSelect;
export type SelectPqp = typeof pqp.$inferSelect;
export type SelectDeregistration = typeof deregistrations.$inferSelect;
export type SelectVehiclePopulation = typeof vehiclePopulation.$inferSelect;
export type SelectPost = typeof posts.$inferSelect;
```

### Usage in Applications

```typescript
import {cars, type SelectCar} from "@motormetrics/database";
import {db} from "./config/db";

// Type-safe database queries
const carData: SelectCar[] = await db.select().from(cars);
```

## Migration Strategy

### Schema Changes

1. **Modify schema files** in `src/schema/` with new tables or columns
2. **Generate migration** using `pnpm generate` to create SQL migration files
3. **Review migration** in `migrations/` directory for correctness
4. **Apply migration** with `pnpm migrate` to update database schema
5. **Update types** automatically inferred from schema changes

### Migration Files

- Located in `migrations/` directory
- Named with timestamp prefix for ordering
- Include both up and down migration SQL
- Tracked in `meta/_journal.json` for consistency

## Development Guidelines

### Schema Design Patterns

- **Column naming**: `camelCase` (e.g., `vehicleClass`, `biddingNo`)
- **Primary keys**: UUID for all tables
- **Constraints**: NOT NULL for core columns, defaults for numeric fields
- **Timestamps**: Include `createdAt`/`modifiedAt` for audit trails

See `schema-design` skill for detailed patterns and indexing strategies.

### Type Safety

- Always export `Insert` and `Select` types from schema files
- Use Drizzle's type inference (`$inferInsert`, `$inferSelect`)
- Leverage TypeScript strict mode for compile-time validation
- Import types from this package in consuming applications

### Performance Optimization

Add indexes based on query patterns and monitor performance. See `query-optimization` skill for indexing strategies and query tuning.

## Environment Configuration

### Database Connection

The package uses `DATABASE_URL` environment variable for PostgreSQL connection:

```bash
DATABASE_URL="postgresql://user:password@host:port/database"
```

### Drizzle Configuration

Configuration in `drizzle.config.ts` using drizzle-kit v0.31.4:

- **Schema**: Points to `./src/schema/index.ts`
- **Output**: Migrations stored in `./migrations`
- **Dialect**: PostgreSQL
- **Driver**: Neon Serverless v1.0.1
- **Credentials**: Uses `DATABASE_URL` environment variable

## Integration with Applications

### Database Connection

Applications should create their own database connection using this schema:

```typescript
import {drizzle} from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@motormetrics/database";

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, {schema});
```

### Query Patterns

Common query patterns for each table:

```typescript
// Cars: Monthly registration data
await db.select().from(cars).where(eq(cars.month, "2024-01"));

// COE: Latest bidding results
await db.select().from(coe).orderBy(desc(coe.month));

// PQP: Prevailing quota premium rates
await db.select().from(pqp).where(eq(pqp.month, "2024-01"));

// Deregistrations: Monthly deregistration data by category
await db.select().from(deregistrations).where(eq(deregistrations.month, "2024-01"));

// Posts: Published blog content
await db.select().from(posts).where(isNotNull(posts.publishedAt));
```

## Best Practices

### Schema Evolution

Always generate migrations and test before production. See `schema-design` skill for migration workflows and breaking change management.

### Type Management

- Re-export types from package index for clean imports
- Use descriptive type names that match table purposes
- Maintain type consistency across the monorepo
- Leverage Drizzle's automatic type inference

### Performance

- Add indexes based on actual query patterns
- Monitor slow queries and optimize schema accordingly
- Use appropriate data types for storage efficiency
- Consider partitioning for large historical datasets
