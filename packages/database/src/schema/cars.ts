import {
  index,
  integer,
  snakeCase,
  text,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const cars = snakeCase.table(
  "cars",
  {
    id: uuid().defaultRandom().primaryKey(),
    month: text().notNull(),
    make: text().notNull(),
    importerType: text(),
    fuelType: text().notNull(),
    vehicleType: text().notNull(),
    number: integer().default(0),
  },
  (table) => [
    unique()
      .on(
        table.month,
        table.make,
        table.importerType,
        table.fuelType,
        table.vehicleType,
      )
      .nullsNotDistinct(),
    // Narrow single-column indexes, not the composites that cover them: the
    // planner picks these because they touch far fewer pages than the wide
    // unique index above. Measured on staging, Sep 2026 — `(month)` alone
    // served 124,699 scans, `(make)` 5,476, while `(month, make)` and
    // `(make, fuel_type)` served none and were dropped.
    index().on(table.month),
    index().on(table.make),
    index().on(table.fuelType),
    index().on(table.number),
  ],
);

export type InsertCar = typeof cars.$inferInsert;
export type SelectCar = typeof cars.$inferSelect;
