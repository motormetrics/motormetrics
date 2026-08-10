# MotorMetrics Database - Developer Reference Guide

## Schema Change Workflow

Modify schema files in `src/schema/`, then `pnpm push` to apply them to the
**development** Neon branch and iterate there. Once the shape has settled, `pnpm
generate` → review the generated SQL in `migrations/` → `pnpm migrate` →
`pnpm migrate:check` to validate consistency. Types update automatically via Drizzle
inference; never hand-edit generated migrations or `migrations/meta/_journal.json`.

`push` is for **development only**. It mutates the schema without recording a row in
`drizzle.__drizzle_migrations`, so the development ledger drifts from the repo by
design and should never be "repaired" to match. Staging and production get schema
changes solely through generated migrations applied by `migrate` — always generate and
test a migration before production.

## Naming Conventions

**Table names**: `snake_case` (e.g., `cars`, `coe`, `pqp`)
**Column names**: `camelCase` (e.g., `vehicleClass`, `biddingNo`, `fuelType`) — this is
deliberate and differs from the usual Drizzle/Postgres `snake_case` default.
**Indexes**: Auto-generated names (no explicit naming required)

## Domain Vocabulary

**Month format**: all `month` columns are text in `YYYY-MM` format (e.g., `"2024-01"`).
`vehicle_population.year` is text in `YYYY` format. They are text, not dates, because
the upstream LTA DataMall feeds publish them that way.

**COE categories** (`coe.vehicleClass`, `pqp.vehicleClass`):

- **A**: Cars up to 1600cc & 130bhp
- **B**: Cars above 1600cc or 130bhp
- **C**: Goods vehicles & buses
- **D**: Motorcycles
- **E**: Open category

`coe.biddingNo` is the bidding exercise within the month — 1 or 2 (two exercises run
each month).

**VQS categories** (`deregistrations.category`) use the full label form, not the COE
letter form: `"Category A"`, `"Category B"`, `"Category C"`, `"Category D"`,
`"Vehicles Exempted From VQS"`, `"Taxis"`.

**PQP table rename**: the `pqp` table was formerly named `coe_pqp`. Older migrations and
any external references may still use the old name.

**Posts uniqueness**: `posts` has a compound unique constraint on `month` + `dataType`
("cars" or "coe"). This is what makes AI blog generation idempotent — re-running a
generation for a month upserts the existing post instead of creating a duplicate.
`slug` is separately unique for URL routing.

## Environment Configuration

The package uses `DATABASE_URL` environment variable for PostgreSQL connection:

```bash
DATABASE_URL="postgresql://user:password@host:port/database"
```

## Performance

Add indexes based on actual query patterns rather than speculatively; monitor slow
queries and adjust the schema accordingly. Consider partitioning for large historical
datasets.
