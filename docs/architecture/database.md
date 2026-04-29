# Database Schema

This document describes the PostgreSQL database schema used by the MotorMetrics platform, including table structures, relationships, and indexing strategies.

## Entity Relationship Diagram

```mermaid
erDiagram
    cars {
        uuid id PK "Primary key (auto-generated)"
        text month "Month in YYYY-MM format"
        text make "Vehicle manufacturer"
        text importer_type "Registration type"
        text fuel_type "Petrol, Diesel, Electric, Hybrid"
        text vehicle_type "Cars, Motor cycles, Buses, etc"
        integer number "Number of registrations"
    }

    coe {
        uuid id PK "Primary key (auto-generated)"
        text month "Bidding month YYYY-MM"
        integer bidding_no "Bidding exercise number (1 or 2)"
        text vehicle_class "COE category"
        integer quota "Available certificates"
        integer bids_success "Successful bids"
        integer bids_received "Total bids submitted"
        integer premium "Winning premium in SGD"
    }

    pqp {
        uuid id PK "Primary key (auto-generated)"
        text month "Month YYYY-MM"
        text vehicle_class "COE category"
        integer pqp "Prevailing Quota Premium rate"
    }

    posts {
        uuid id PK "Primary key (auto-generated)"
        text title "Blog post title"
        text slug UK "URL-friendly identifier"
        text content "Markdown content"
        text excerpt "2-3 sentence summary"
        text hero_image "Unsplash URL for header"
        text[] tags "Category tags array"
        jsonb highlights "Key statistics for display"
        text status "Publication status (draft/published)"
        jsonb metadata "Additional metadata"
        text month "Source data month YYYY-MM"
        text data_type "Source type (cars/coe)"
        timestamp created_at "Creation timestamp"
        timestamp modified_at "Last modification timestamp"
        timestamp published_at "Publication date"
    }

    deregistrations {
        uuid id PK "Primary key (auto-generated)"
        text month "Month in YYYY-MM format"
        text category "VQS category"
        integer number "Number of deregistrations"
    }

    %% Relationships (conceptual, not foreign keys)
    posts ||--o{ cars : "generated from cars data"
    posts ||--o{ coe : "generated from coe data"
    coe ||--o{ pqp : "related by month and vehicle_class"
```

## Table Specifications

### Cars Table

**Purpose**: Stores monthly vehicle registration data from LTA DataMall

**Table Definition**:
```sql
CREATE TABLE cars (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT,
    make TEXT,
    importer_type TEXT,
    fuel_type TEXT,
    vehicle_type TEXT,
    number INTEGER
);
```

**Columns**:
- `id`: UUID primary key (auto-generated)
- `month`: Registration month in YYYY-MM format (e.g., "2024-01")
- `make`: Vehicle manufacturer name (e.g., "TOYOTA", "BMW")
- `importer_type`: Registration type classification
- `fuel_type`: Fuel type ("Petrol", "Diesel", "Electric", "Hybrid")
- `vehicle_type`: Vehicle category ("Cars", "Motor cycles", "Buses", etc.)
- `number`: Number of registrations for the specific combination

**Indexes**:
```sql
-- Optimized for common query patterns
CREATE INDEX month_make_idx ON cars (month, make);
CREATE INDEX month_idx ON cars (month);
CREATE INDEX make_idx ON cars (make);
CREATE INDEX fuel_type_idx ON cars (fuel_type);
CREATE INDEX make_fuel_type_idx ON cars (make, fuel_type);
CREATE INDEX number_idx ON cars (number);
```

**Common Queries**:
- Monthly registration summaries by make
- Fuel type distribution analysis
- Vehicle type breakdowns
- Historical trend analysis

### COE Bidding Results Table

**Purpose**: Stores Certificate of Entitlement bidding exercise results

**Table Definition**:
```sql
CREATE TABLE coe (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL,
    bidding_no INTEGER NOT NULL,
    vehicle_class TEXT NOT NULL,
    quota INTEGER NOT NULL,
    bids_success INTEGER NOT NULL,
    bids_received INTEGER NOT NULL,
    premium INTEGER NOT NULL
);
```

**Columns**:
- `id`: UUID primary key
- `month`: Bidding month (YYYY-MM format), NOT NULL
- `bidding_no`: Bidding exercise number (1 or 2 per month), NOT NULL
- `vehicle_class`: COE category classification, NOT NULL
- `quota`: Number of certificates available, NOT NULL
- `bids_success`: Number of successful bids, NOT NULL
- `bids_received`: Total number of bids submitted, NOT NULL
- `premium`: Winning premium amount in SGD, NOT NULL

**Indexes**:
```sql
-- Optimized for bidding analysis and historical queries
CREATE INDEX month_vehicle_idx ON coe (month, vehicle_class);
CREATE INDEX vehicle_class_idx ON coe (vehicle_class);
CREATE INDEX month_bidding_no_idx ON coe (month, bidding_no);
CREATE INDEX premium_idx ON coe (premium);
CREATE INDEX bids_idx ON coe (bids_success, bids_received);
CREATE INDEX month_bidding_no_vehicle_class_idx ON coe (month DESC, bidding_no DESC, vehicle_class);
```

**Common Queries**:
- Latest bidding results by category
- Premium trend analysis
- Bidding success rate calculations
- Historical premium comparisons

### COE Prevailing Quota Premium Table

**Purpose**: Stores monthly PQP rates for immediate vehicle registration

**Table Definition**:
```sql
CREATE TABLE pqp (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT,
    vehicle_class TEXT,
    pqp INTEGER
);
```

**Columns**:
- `id`: UUID primary key
- `month`: Month in YYYY-MM format
- `vehicle_class`: COE category
- `pqp`: Prevailing Quota Premium rate in SGD

**Indexes**:
```sql
-- Optimized for PQP rate lookups
CREATE INDEX pqp_month_vehicle_class_idx ON pqp (month, vehicle_class);
CREATE INDEX pqp_vehicle_class_idx ON pqp (vehicle_class);
CREATE INDEX pqp_idx ON pqp (pqp);
```

### Blog Posts Table

**Purpose**: Stores LLM-generated blog content with structured output from AI generation

**Table Definition**:
```sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    hero_image TEXT,
    tags TEXT[],
    highlights JSONB,
    status TEXT DEFAULT 'draft',
    metadata JSONB,
    month TEXT,
    data_type TEXT,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL,
    modified_at TIMESTAMP DEFAULT NOW() NOT NULL,
    published_at TIMESTAMP,
    UNIQUE (month, data_type)
);
```

**Columns**:
- `id`: UUID primary key
- `title`: Blog post title, NOT NULL
- `slug`: URL-friendly identifier (unique), NOT NULL
- `content`: Markdown-formatted blog content, NOT NULL
- `excerpt`: 2-3 sentence summary for meta description
- `hero_image`: Unsplash URL for blog post header
- `tags`: Category tags array (Text[])
- `highlights`: Key statistics for visual display (JSONB)
- `status`: Publication status (draft/published), default 'draft'
- `metadata`: Additional metadata (JSONB)
- `month`: Source data month (YYYY-MM format)
- `data_type`: Source data type ('cars' or 'coe')
- `created_at`: Creation timestamp
- `modified_at`: Last modification timestamp
- `published_at`: Publication timestamp (NULL for drafts)

**Constraints**:
- Unique constraint on `slug` for URL routing
- Composite unique constraint on `(month, data_type)` to prevent duplicate posts

**Common Queries**:
- Published posts ordered by date
- Posts filtered by tags
- Posts by data month or type

### Deregistrations Table

**Purpose**: Stores monthly vehicle deregistration data under the Vehicle Quota System (VQS) from LTA DataMall

**Table Definition**:
```sql
CREATE TABLE deregistrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL,
    category TEXT NOT NULL,
    number INTEGER DEFAULT 0
);
```

**Columns**:
- `id`: UUID primary key
- `month`: Deregistration month (YYYY-MM format), NOT NULL
- `category`: VQS category (e.g., "Category A", "Category B", "Vehicles Exempted From VQS", "Taxis"), NOT NULL
- `number`: Number of deregistrations, default 0

**Indexes**:
```sql
-- Optimized for deregistration queries
CREATE INDEX month_category_idx ON deregistrations (month, category);
CREATE INDEX deregistrations_month_idx ON deregistrations (month);
CREATE INDEX deregistrations_category_idx ON deregistrations (category);
CREATE INDEX deregistrations_number_idx ON deregistrations (number);
```

**Common Queries**:
- Monthly deregistration summaries by category
- Historical deregistration trends
- Category-wise analysis

## Indexing Strategy

### Performance Optimization

**Composite Indexes**: Created for common multi-column queries
- `(month, make)`: Cars filtered by month and manufacturer
- `(month, vehicle_class)`: COE data by month and category
- `(month, bidding_no, vehicle_class)`: Complex COE queries

**Single Column Indexes**: Support filtering and sorting
- Date/month columns for temporal queries
- Category columns for grouping operations
- Numeric columns for range queries and sorting

### Index Maintenance

**Automatic Maintenance**: PostgreSQL automatically maintains indexes
**Query Analysis**: Use `EXPLAIN ANALYZE` to verify index usage
**Performance Monitoring**: Monitor slow queries and add indexes as needed

## Data Relationships

### Conceptual Relationships

While the schema doesn't use foreign key constraints, there are logical relationships:

**Posts → Cars/COE Data**: Blog posts are generated from specific month's data
- `posts.metadata.data_month` relates to `cars.month` or `coe.month`
- `posts.metadata.data_type` indicates source table ("cars" or "coe")

**COE → COE PQP**: Related by month and vehicle class
- Both tables share `month` and `vehicle_class` fields
- PQP rates complement bidding results for complete COE picture

### Data Integrity

**Unique Constraints**: Blog post slugs must be unique
**NOT NULL Constraints**: Essential fields are required
**Application-Level Validation**: Business logic enforces data consistency

## Migration Management

### Drizzle ORM Integration

**Schema Definition**: Tables defined using Drizzle ORM TypeScript schema
**Migration Generation**: `pnpm generate` creates SQL migration files
**Migration Execution**: `pnpm migrate` applies pending migrations

**Migration Workflow**:
```bash
# 1. Modify schema files in packages/database/src/schema/
# 2. Generate migration
pnpm generate

# 3. Review generated SQL in migrations/ directory
# 4. Apply migration
pnpm migrate

# 5. Verify schema consistency
pnpm migrate:check
```

### Schema Evolution

**Backward Compatibility**: Migrations designed to be non-breaking
**Version Control**: All migration files committed to repository
**Rollback Strategy**: Down migrations available for schema rollbacks

## Performance Considerations

### Query Optimization

**Selective Indexes**: Indexes created based on actual query patterns
**Composite Indexes**: Multi-column indexes for complex WHERE clauses
**Covering Indexes**: Include frequently selected columns in index

### Storage Efficiency

**UUID vs Serial**: UUIDs for distributed systems, Serial for simple counters
**JSONB Storage**: Efficient storage and querying for semi-structured data
**Text vs VARCHAR**: Text type for flexible string storage

### Scaling Considerations

**Partitioning Potential**: Tables can be partitioned by month for large datasets
**Read Replicas**: Read-only replicas can be added for scaled read operations
**Connection Pooling**: Application uses connection pooling for efficiency

## Related Documentation

- [System Architecture Overview](./system)
- [Data Processing Workflows](./workflows)
- [API Architecture](./api)
- [Database Package Documentation](../../packages/database/CLAUDE.md)